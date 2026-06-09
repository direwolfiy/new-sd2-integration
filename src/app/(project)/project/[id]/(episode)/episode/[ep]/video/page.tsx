"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Film, Sparkles } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { aiApi, episodesApi, shotsApi, useApi, videosApi } from "@/lib/api";
import { adaptSeedanceAssets, getChapterContent } from "@/lib/adapters";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  adaptVideoHistory,
  fetchShotPreviewMap,
  getFinalVideoMap,
  normalizeVideoShot,
} from "./_components/video-data";
import type {
  ShotPreviewMap,
  VideoHistoryItem,
} from "./_components/types";
import { AssetPanel } from "./_components/asset-panel";
import { SkeletonBlock } from "./_components/skeleton-block";
import { GenerationHistory } from "./_components/video-results";
import { ShotStrip } from "./_components/shot-strip";
import { PromptPanel } from "./_components/prompt-panel";
import {
  adaptVideoModelOptions,
  DEFAULT_VIDEO_CHANNEL,
  DEFAULT_VIDEO_MODEL,
  getOptionValue,
} from "./_components/video-options";
import { VideoPreviewDialog } from "./_components/video-preview-dialog";

function VideoWorkspaceSkeleton() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)] gap-4 overflow-hidden p-4">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.12] px-4">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <SkeletonBlock className="mb-3 h-6 w-20" />
          <SkeletonBlock className="min-h-96 flex-1" />
        </div>
        <div className="grid shrink-0 grid-cols-4 gap-2 border-t border-white/[0.12] px-4 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-10" />
              <SkeletonBlock className="h-8 w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-white/[0.12] bg-[#181818]">
        <div className="p-4">
          <SkeletonBlock className="mb-3 h-6 w-20" />
          <div className="mb-5 grid grid-cols-4 gap-3">
            <AspectRatio ratio={9 / 16}>
              <SkeletonBlock className="h-full w-full" />
            </AspectRatio>
          </div>
          <SkeletonBlock className="mb-3 h-6 w-20" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <AspectRatio key={index} ratio={9 / 16}>
                <SkeletonBlock className="h-full w-full" />
              </AspectRatio>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ShotStripSkeleton() {
  return (
    <div className="shrink-0 border-t border-white/[0.12] bg-[#101010] px-5 py-3">
      <div className="flex items-center gap-3 pb-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-40 shrink-0">
            <AspectRatio ratio={16 / 9}>
              <SkeletonBlock className="h-full w-full" />
            </AspectRatio>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VideoPage() {
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_VIDEO_MODEL.id);
  const [selectedChannel, setSelectedChannel] = useState(
    DEFAULT_VIDEO_CHANNEL.id,
  );
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [selectedSound, setSelectedSound] = useState("有声");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<VideoHistoryItem | null>(null);
  const [previewShotId, setPreviewShotId] = useState<string | null>(null);
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({});
  const [finalVideoOverrides, setFinalVideoOverrides] = useState<
    Record<string, string | null>
  >({});
  const [updatingFinalId, setUpdatingFinalId] = useState<string | null>(null);

  const { data: chapter } = useApi(
    () => episodesApi.fetchChapter(episodeId),
    [episodeId],
  );
  const { data: storyboardData, isLoading: shotsLoading } = useApi(
    () => shotsApi.fetchSeedanceScripts(episodeId, true),
    [episodeId],
  );
  const { data: finalVideoData } = useApi(
    () => shotsApi.fetchChapterScripts(episodeId),
    [episodeId],
  );
  const {
    data: rawAssets,
    isLoading: assetsLoading,
    refetch: refetchAssets,
  } = useApi(
    () => shotsApi.fetchSeedanceAssets(episodeId, projectId),
    [episodeId, projectId],
  );
  const { data: rawModelData } = useApi(
    () => aiApi.fetchAvailableVideoModelsByBusinessType(5),
    [],
  );

  const modelOptions = useMemo(
    () => adaptVideoModelOptions(rawModelData),
    [rawModelData],
  );
  const selectedModelOption = useMemo(
    () =>
      modelOptions.find((model) => model.id === selectedModel) ??
      modelOptions[0] ??
      DEFAULT_VIDEO_MODEL,
    [modelOptions, selectedModel],
  );
  const selectedChannelOption = useMemo(
    () =>
      selectedModelOption.channels.find(
        (channel) => channel.id === selectedChannel,
      ) ??
      selectedModelOption.channels[0] ??
      DEFAULT_VIDEO_CHANNEL,
    [selectedChannel, selectedModelOption],
  );
  useEffect(() => {
    if (!modelOptions.some((model) => model.id === selectedModel)) {
      setSelectedModel(modelOptions[0]?.id ?? DEFAULT_VIDEO_MODEL.id);
    }
  }, [modelOptions, selectedModel]);
  useEffect(() => {
    if (
      !selectedModelOption.channels.some(
        (channel) => channel.id === selectedChannel,
      )
    ) {
      setSelectedChannel(
        selectedModelOption.channels[0]?.id ?? DEFAULT_VIDEO_CHANNEL.id,
      );
    }
  }, [selectedChannel, selectedModelOption]);
  useEffect(() => {
    setSelectedDuration((value) =>
      getOptionValue(value, selectedChannelOption.durations),
    );
    setSelectedResolution((value) =>
      getOptionValue(value, selectedChannelOption.resolutions),
    );
    setSelectedRatio((value) =>
      getOptionValue(value, selectedChannelOption.supportedRatios),
    );
    setSelectedSound((value) =>
      getOptionValue(value, selectedChannelOption.soundOptions),
    );
  }, [selectedChannelOption]);
  const assets = useMemo(
    () => adaptSeedanceAssets(rawAssets ?? []),
    [rawAssets],
  );
  const shots = useMemo(
    () => (storyboardData?.scripts ?? []).map(normalizeVideoShot),
    [storyboardData],
  );
  const finalVideoMap = useMemo(
    () => getFinalVideoMap(finalVideoData),
    [finalVideoData],
  );
  const videoShots = useMemo(
    () =>
      shots.map((shot) => {
        const finalVideoUrl =
          finalVideoOverrides[shot.id] === undefined
            ? (finalVideoMap[shot.id] ?? null)
            : finalVideoOverrides[shot.id];

        return {
          ...shot,
          finalVideoUrl,
          hasVideo: Boolean(finalVideoUrl ?? shot.videoUrl ?? shot.hasVideo),
        };
      }),
    [finalVideoMap, finalVideoOverrides, shots],
  );
  const shotPreviewKey = useMemo(
    () => videoShots.map((shot) => `${shot.id}:${shot.hasVideo ? 1 : 0}`).join("|"),
    [videoShots],
  );
  const { data: shotPreviewMap } = useApi(
    () =>
      videoShots.length
        ? fetchShotPreviewMap(videoShots)
        : Promise.resolve({} as ShotPreviewMap),
    [shotPreviewKey],
  );
  const thumbnailShots = useMemo(
    () =>
      videoShots.map((shot) => ({
        ...shot,
        posterUrl: shotPreviewMap?.[shot.id]?.posterUrl ?? shot.posterUrl,
        videoUrl: shotPreviewMap?.[shot.id]?.videoUrl ?? shot.videoUrl,
      })),
    [shotPreviewMap, videoShots],
  );
  const selectedShotBase = useMemo(
    () =>
      videoShots.find((shot) => shot.id === selectedShotId) ??
      videoShots[0] ??
      null,
    [selectedShotId, videoShots],
  );
  const selectedShot = useMemo(() => {
    if (!selectedShotBase) return null;
    const override = finalVideoOverrides[selectedShotBase.id];
    if (override === undefined) return selectedShotBase;
    return {
      ...selectedShotBase,
      finalVideoUrl: override,
      hasVideo: Boolean(override ?? selectedShotBase.videoUrl),
    };
  }, [finalVideoOverrides, selectedShotBase]);
  const { data: rawVideoHistory, isLoading: videoHistoryLoading } = useApi(
    () =>
      selectedShot
        ? videosApi.fetchVideoHistory({
            businessId: selectedShot.id,
            pageSize: 50,
          })
        : Promise.resolve({ list: [], total: 0, page_num: 1, page_size: 50 }),
    [selectedShot?.id],
  );
  const selectedPrompt =
    selectedShot == null
      ? ""
      : (promptDrafts[selectedShot.id] ?? selectedShot.prompt);
  const videoHistoryItems = useMemo(
    () => (selectedShot ? adaptVideoHistory(rawVideoHistory, selectedShot) : []),
    [rawVideoHistory, selectedShot],
  );
  useEffect(() => {
    if (!previewOpen) return;
    if (!previewItem) {
      setPreviewItem(videoHistoryItems[0] ?? null);
      return;
    }
    const stillExists = videoHistoryItems.some((item) => item.id === previewItem.id);
    if (!stillExists) {
      setPreviewItem(videoHistoryItems[0] ?? null);
    }
  }, [previewItem, previewOpen, videoHistoryItems]);
  const hasScript = !!getChapterContent(chapter).trim();
  const completedCount = shots.filter((shot) => shot.hasVideo).length;

  async function handleToggleFinalVideo(item: VideoHistoryItem) {
    if (!selectedShot || !item.videoUrl || updatingFinalId) return;

    setUpdatingFinalId(item.id);
    const previousVideoUrl = selectedShot.finalVideoUrl ?? null;
    const nextVideoUrl = item.isFinal ? null : item.videoUrl;
    setFinalVideoOverrides((overrides) => ({
      ...overrides,
      [selectedShot.id]: nextVideoUrl,
    }));
    setPreviewItem((current) =>
      current?.id === item.id
        ? { ...current, isFinal: !item.isFinal }
        : current,
    );
    try {
      await videosApi.updateScriptVideoResultUrl(selectedShot.id, {
        videoResultUrl: nextVideoUrl,
      });
    } catch (error) {
      setFinalVideoOverrides((overrides) => ({
        ...overrides,
        [selectedShot.id]: previousVideoUrl,
      }));
      setPreviewItem((current) =>
        current?.id === item.id
          ? { ...current, isFinal: item.isFinal }
          : current,
      );
      sonnerToast.error(
        item.isFinal ? "取消定稿失败" : "设置定稿失败",
        {
          description:
            error instanceof Error ? error.message : "请稍后重试",
        },
      );
    } finally {
      setUpdatingFinalId(null);
    }
  }

  if (!hasScript) {
    const storyboardHref = `/project/${projectId}/episode/${episodeId}/storyboard`;
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
            <BookOpen size={24} strokeWidth={1.5} className="text-[#777]" />
          </div>
          <p className="text-base text-[#a3a3a3]">该分集尚无剧本</p>
          <Link
            href={storyboardHref}
            className="mt-1 flex h-10 items-center rounded-full bg-white px-6 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            前往分镜
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <AssetPanel
        assets={assets}
        projectId={projectId}
        episodeId={episodeId}
        isLoading={assetsLoading}
        onChanged={refetchAssets}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b border-white/[0.12] px-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-white">视频生成</h2>
            <span className="text-xs text-[#777]">
              {shots.length} / {completedCount}
            </span>
          </div>
          <Button variant="ghost" size="sm" title="批量生成视频">
            <Sparkles />
            批量生成
          </Button>
        </div>

        {shotsLoading ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <VideoWorkspaceSkeleton />
            <ShotStripSkeleton />
          </div>
        ) : shots.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
              <Film size={24} strokeWidth={1.5} className="text-[#777]" />
            </div>
            <p className="text-base text-[#a3a3a3]">请先完成分镜</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {selectedShot && (
              <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)] gap-4 overflow-hidden p-4">
                <PromptPanel
                  selectedShot={selectedShot}
                  selectedPrompt={selectedPrompt}
                  selectedModel={selectedModel}
                  selectedChannel={selectedChannel}
                  modelOptions={modelOptions}
                  selectedModelOption={selectedModelOption}
                  selectedChannelOption={selectedChannelOption}
                  selectedDuration={selectedDuration}
                  selectedResolution={selectedResolution}
                  selectedRatio={selectedRatio}
                  selectedSound={selectedSound}
                  onPromptChange={(value) =>
                    setPromptDrafts((drafts) => ({
                      ...drafts,
                      [selectedShot.id]: value,
                    }))
                  }
                  onModelChange={setSelectedModel}
                  onChannelChange={setSelectedChannel}
                  onDurationChange={setSelectedDuration}
                  onResolutionChange={setSelectedResolution}
                  onRatioChange={setSelectedRatio}
                  onSoundChange={setSelectedSound}
                />

                <GenerationHistory
                  historyItems={videoHistoryItems}
                  isLoading={videoHistoryLoading}
                  shot={selectedShot}
                  onToggleFinal={handleToggleFinalVideo}
                  updatingFinalId={updatingFinalId}
                  onPreview={(item) => {
                    setPreviewShotId(selectedShot.id);
                    setPreviewItem(item);
                    setPreviewOpen(true);
                  }}
                />
              </div>
            )}

            <ShotStrip
              shots={thumbnailShots}
              selectedShotId={selectedShot?.id ?? null}
              onSelectShot={setSelectedShotId}
            />

            <VideoPreviewDialog
              item={previewItem}
              shot={selectedShot}
              shots={thumbnailShots}
              historyItems={videoHistoryItems}
              open={previewOpen}
              onOpenChange={(open) => {
                setPreviewOpen(open);
                if (!open) {
                  setPreviewItem(null);
                  setPreviewShotId(null);
                }
              }}
              onSelectShot={(shotId) => {
                setPreviewShotId(shotId);
                setSelectedShotId(shotId);
                setPreviewItem(null);
              }}
              previewShotId={previewShotId}
              onSelectVersion={setPreviewItem}
              onToggleFinal={handleToggleFinalVideo}
              updatingFinalId={updatingFinalId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
