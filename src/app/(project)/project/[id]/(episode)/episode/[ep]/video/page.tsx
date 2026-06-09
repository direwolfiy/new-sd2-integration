"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Film, Sparkles } from "lucide-react";
import { episodesApi, shotsApi, useApi, videosApi } from "@/lib/api";
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
  const [selectedModel, setSelectedModel] = useState("Seedance 2.0");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [selectedSound, setSelectedSound] = useState("有声");
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
  const { data: rawAssets, isLoading: assetsLoading } = useApi(
    () => shotsApi.fetchSeedanceAssets(episodeId, projectId),
    [episodeId, projectId],
  );

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
      shots.map((shot) => ({
        ...shot,
        videoUrl:
          finalVideoOverrides[shot.id] === undefined
            ? (finalVideoMap[shot.id] ?? shot.videoUrl)
            : finalVideoOverrides[shot.id],
        hasVideo: Boolean(
          finalVideoOverrides[shot.id] === undefined
            ? (finalVideoMap[shot.id] ?? shot.videoUrl ?? shot.hasVideo)
            : finalVideoOverrides[shot.id],
        ),
      })),
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
      videoUrl: override,
      hasVideo: Boolean(override),
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
  const hasScript = !!getChapterContent(chapter).trim();
  const completedCount = shots.filter((shot) => shot.hasVideo).length;

  async function handleToggleFinalVideo(item: VideoHistoryItem) {
    if (!selectedShot || !item.videoUrl || updatingFinalId) return;

    setUpdatingFinalId(item.id);
    const nextVideoUrl = item.isFinal ? null : item.videoUrl;
    try {
      await videosApi.updateScriptVideoResultUrl(selectedShot.id, {
        videoResultUrl: nextVideoUrl,
      });
      setFinalVideoOverrides((overrides) => ({
        ...overrides,
        [selectedShot.id]: nextVideoUrl,
      }));
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
      <AssetPanel assets={assets} isLoading={assetsLoading} />

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
                />
              </div>
            )}

            <ShotStrip
              shots={thumbnailShots}
              selectedShotId={selectedShot?.id ?? null}
              onSelectShot={setSelectedShotId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
