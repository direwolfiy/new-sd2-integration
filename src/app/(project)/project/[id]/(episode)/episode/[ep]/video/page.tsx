"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Clock,
  Coins,
  Film,
  ImageIcon,
  Play,
  PlayCircle,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { episodesApi, shotsApi, useApi, videosApi } from "@/lib/api";
import { adaptSeedanceAssets, getChapterContent } from "@/lib/adapters";
import type { ElementItem } from "@/mocks/types";
import type { SeedanceScriptItem } from "@/lib/api/shots";
import type { VideoGenerationHistoryItem } from "@/lib/api/videos";
import type { SceneScriptItem } from "@/lib/api/types";
import { useParams } from "next/navigation";
import { calcVideoCost } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type VideoShot = {
  id: string;
  number: number;
  description: string;
  prompt: string;
  duration: number | null;
  hasVideo: boolean;
  videoCount: number;
  posterUrl: string | null;
  videoUrl: string | null;
};

type VideoHistoryItem = {
  id: string;
  version: number;
  status: "pending" | "generating" | "completed";
  videoUrl: string | null;
  posterUrl: string | null;
  isFinal: boolean;
};

const assetLabels: Record<ElementItem["type"], string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  material: "素材",
  audio: "音频",
  script: "剧本",
};

function firstPresentString(
  ...values: Array<string | number | null | undefined>
) {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}

function normalizeVideoShot(
  item: SeedanceScriptItem,
  index: number,
): VideoShot {
  const videoUrl = firstPresentString(
    item.videoUrl,
    item.video_url,
    item.videoResultUrl,
    item.video_result_url,
    item.resultVideoUrl,
    item.result_video_url,
  );
  const posterUrl = firstPresentString(
    item.thumbnailUrl,
    item.thumbnail_url,
    item.coverUrl,
    item.cover_url,
    item.lastFrameUrl,
    item.last_frame_url,
    item.imageUrl,
    item.image_url,
    item.imageResultUrl,
    item.image_result_url,
    item.resultImageUrl,
    item.result_image_url,
  );
  const bodyText =
    typeof item.body === "string" ? parseShotBodyContent(item.body) : null;
  return {
    id: String(item.id ?? index + 1),
    number: Number(item.sequence ?? item.order_sort ?? index + 1),
    description:
      firstPresentString(
        item.rawDescription,
        item.raw_description,
        item.speechContent,
        item.speech_content,
        item.sourceText,
        item.source_text,
        bodyText,
        item.title,
        typeof item.dialogue === "string" ? item.dialogue : null,
      ) ?? "",
    prompt: firstPresentString(item.videoPrompt, item.video_prompt) ?? "",
    duration:
      item.estimatedDuration ??
      item.estimated_duration ??
      item.duration_seconds ??
      null,
    hasVideo: Boolean(item.hasVideoResult ?? item.has_video_result ?? videoUrl),
    videoCount: Number(
      item.videoCount ??
        item.video_count ??
        (item.hasVideoResult || item.has_video_result ? 1 : 0),
    ),
    posterUrl,
    videoUrl,
  };
}

function parseShotBodyContent(body: string) {
  try {
    const parsed = JSON.parse(body) as {
      content?: unknown;
      rawDescription?: unknown;
      raw_description?: unknown;
    };
    return firstPresentString(
      typeof parsed.content === "string" ? parsed.content : null,
      typeof parsed.rawDescription === "string" ? parsed.rawDescription : null,
      typeof parsed.raw_description === "string" ? parsed.raw_description : null,
    );
  } catch {
    return body;
  }
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.08] ${className}`} />;
}

function normalizeVideoStatus(
  status?: string | null,
  taskStatus?: string | null,
): VideoHistoryItem["status"] {
  const value = String(taskStatus ?? status ?? "").toUpperCase();
  if (value === "COMPLETED" || value === "SUCCEEDED" || value === "SUCCESS") {
    return "completed";
  }
  if (value === "RUNNING" || value === "PROCESSING" || value === "GENERATING") {
    return "generating";
  }
  return "pending";
}

function getVideoHistoryList(
  data:
    | Awaited<ReturnType<typeof videosApi.fetchVideoHistory>>
    | null
    | undefined,
): VideoGenerationHistoryItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.list ?? [];
}

function getHistoryVideoUrl(item: VideoGenerationHistoryItem) {
  return firstPresentString(
    item.videoUrl,
    item.video_url,
    item.videoResultUrl,
    item.video_result_url,
    item.resultVideoUrl,
    item.result_video_url,
    item.videoUrls?.find(Boolean),
    item.video_urls?.find(Boolean),
  );
}

function getHistoryPosterUrl(
  item: VideoGenerationHistoryItem,
  shot: VideoShot,
) {
  return firstPresentString(
    item.thumbnailUrl,
    item.thumbnail_url,
    item.lastFrameUrl,
    item.last_frame_url,
    item.coverUrl,
    item.cover_url,
    item.imageUrl,
    item.image_url,
    shot.posterUrl,
  );
}

function adaptVideoHistory(
  data: Awaited<ReturnType<typeof videosApi.fetchVideoHistory>> | null,
  shot: VideoShot,
): VideoHistoryItem[] {
  const rawItems = getVideoHistoryList(data);
  const completedItems = rawItems
    .filter(
      (item) => normalizeVideoStatus(item.status, item.taskStatus) === "completed",
    )
    .filter((item) => getHistoryVideoUrl(item))
    .reverse();
  const seenUrls = new Set<string>();
  const historyItems = completedItems.flatMap((item) => {
    const videoUrl = getHistoryVideoUrl(item);
    if (!videoUrl || seenUrls.has(videoUrl)) return [];
    seenUrls.add(videoUrl);
    return [
      {
        id: String(item.taskId ?? item.id ?? videoUrl),
        version: seenUrls.size,
        status: "completed" as const,
        videoUrl,
        posterUrl: getHistoryPosterUrl(item, shot),
        isFinal: videoUrl === shot.videoUrl,
      },
    ];
  });

  if (historyItems.length > 0) return historyItems;
  if (!shot.videoUrl) return [];

  return [
    {
      id: `${shot.id}-current`,
      version: 1,
      status: "completed",
      videoUrl: shot.videoUrl,
      posterUrl: shot.posterUrl,
      isFinal: true,
    },
  ];
}

type ShotPreviewMap = Record<string, Pick<VideoShot, "posterUrl" | "videoUrl">>;

function getFinalVideoMap(
  data:
    | SceneScriptItem[]
    | Awaited<ReturnType<typeof shotsApi.fetchChapterScripts>>
    | null
    | undefined,
) {
  const items = Array.isArray(data)
    ? data
    : "list" in (data ?? {})
      ? (data?.list ?? [])
      : "scripts" in (data ?? {})
        ? ((data as { scripts?: SceneScriptItem[] }).scripts ?? [])
        : [];
  return Object.fromEntries(
    items.map((item) => [
      String(item.id),
      firstPresentString(item.videoUrl, item.video_result_url),
    ]),
  ) as Record<string, string | null>;
}

async function fetchShotPreviewMap(shots: VideoShot[]): Promise<ShotPreviewMap> {
  const previewEntries = await Promise.all(
    shots.map(async (shot) => {
      if (shot.posterUrl || shot.videoUrl || !shot.hasVideo) {
        return [shot.id, { posterUrl: shot.posterUrl, videoUrl: shot.videoUrl }] as const;
      }

      try {
        const data = await videosApi.fetchVideoHistory({
          businessId: shot.id,
          pageSize: 10,
        });
        const latestCompleted = getVideoHistoryList(data).find(
          (item) =>
            normalizeVideoStatus(item.status, item.taskStatus) === "completed" &&
            getHistoryVideoUrl(item),
        );

        return [
          shot.id,
          {
            posterUrl: latestCompleted
              ? getHistoryPosterUrl(latestCompleted, shot)
              : shot.posterUrl,
            videoUrl: latestCompleted
              ? getHistoryVideoUrl(latestCompleted)
              : shot.videoUrl,
          },
        ] as const;
      } catch {
        return [shot.id, { posterUrl: shot.posterUrl, videoUrl: shot.videoUrl }] as const;
      }
    }),
  );

  return Object.fromEntries(previewEntries) as ShotPreviewMap;
}

function getPlayableVideoUrl(url: string) {
  return url.startsWith("/")
    ? url
    : `/api/video-proxy?url=${encodeURIComponent(url)}`;
}

function formatVideoDuration(seconds: number | null) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function AssetPanel({
  assets,
  isLoading = false,
}: {
  assets: ElementItem[];
  isLoading?: boolean;
}) {
  const groups = useMemo(() => {
    const visible = assets.filter(
      (asset) => asset.type !== "script" && asset.type !== "audio",
    );
    return (["character", "scene", "prop", "material"] as const).map((type) => ({
      type,
      items: visible.filter((asset) => asset.type === type),
    }));
  }, [assets]);

  return (
    <aside className="flex min-h-0 w-64 shrink-0 flex-col border-r border-white/[0.12] bg-[#101010]">
      <div className="flex h-11 items-center justify-between border-b border-white/[0.12] px-4">
        <h2 className="text-sm font-medium text-white">本集资产</h2>
        <span className="text-xs text-[#777]">{assets.length}</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">
          {isLoading ? (
            <AssetPanelSkeleton />
          ) : (
            groups.map((group) => (
              <section key={group.type} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-[#a3a3a3]">
                    {assetLabels[group.type]}
                  </span>
                  <span className="text-xs text-[#777]">
                    {group.items.length}
                  </span>
                </div>
                {group.items.length === 0 ? (
                  <div className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-[#777]">
                    暂无
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {group.items.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-[#181818] p-2"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#2b2b2b]">
                          {asset.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : group.type === "character" ? (
                            <Users size={16} className="text-[#888]" />
                          ) : (
                            <ImageIcon size={16} className="text-[#888]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-[#d8d8d8]">
                            {asset.name || "未命名"}
                          </p>
                          {asset.tags.length > 0 && (
                            <p className="mt-1 truncate text-xs text-[#777]">
                              {asset.tags.join(" / ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function AssetPanelSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, groupIndex) => (
        <section key={groupIndex}>
          <div className="mb-2 flex items-center justify-between px-1">
            <SkeletonBlock className="h-4 w-12" />
            <SkeletonBlock className="h-4 w-4" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((__, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-[#181818] p-2"
              >
                <SkeletonBlock className="h-9 w-9 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SelectPill({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  showLabel = true,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: React.ElementType;
  showLabel?: boolean;
}) {
  return (
    <label className="min-w-0">
      {showLabel && (
        <span className="mb-2 block text-xs text-[#8f8f8f]">{label}</span>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8f8f]"
          />
        )}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-8 w-full appearance-none rounded-md border border-white/[0.14] bg-[#202020] pr-7 text-xs text-[#d8d8d8] outline-none transition-colors duration-200 hover:border-white/[0.22] focus:border-[#00CAE0]/60 ${
            Icon ? "pl-7" : "pl-3"
          }`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function ParameterSummary({
  duration,
  resolution,
  ratio,
  sound,
}: {
  duration: string;
  resolution: string;
  ratio: string;
  sound: string;
}) {
  return `${duration} / ${resolution} / ${ratio} / ${sound}`;
}

function VideoPreview({
  shot,
}: {
  shot: VideoShot;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number | null>(
    shot.duration ?? null,
  );

  if (shot.videoUrl) {
    const playableUrl = getPlayableVideoUrl(shot.videoUrl);
    const playFromStart = () => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = 0;
      void video.play();
    };
    const stopAndReset = () => {
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      video.currentTime = 0;
    };

    return (
      <div
        className="relative h-full w-full bg-black"
        onMouseEnter={playFromStart}
        onMouseLeave={stopAndReset}
        onFocus={playFromStart}
        onBlur={stopAndReset}
      >
        <video
          ref={videoRef}
          src={playableUrl}
          poster={shot.posterUrl ?? undefined}
          playsInline
          preload="metadata"
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration);
          }}
          className="h-full w-full object-contain"
        />
        <div className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-xs font-medium text-white/75 backdrop-blur-sm">
          {formatVideoDuration(duration)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      {shot.hasVideo ? (
        <Play
          size={24}
          strokeWidth={1.5}
          className="text-[#00CAE0]"
        />
      ) : (
        <span className="text-sm text-muted-foreground">暂无视频</span>
      )}
    </div>
  );
}

function StoryboardThumbnail({ shot }: { shot: VideoShot }) {
  if (shot.posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={shot.posterUrl}
        alt=""
        className="h-full w-full object-cover"
      />
    );
  }

  if (shot.videoUrl) {
    return (
      <video
        src={getPlayableVideoUrl(shot.videoUrl)}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Film size={18} strokeWidth={1.5} className="text-muted-foreground" />
    </div>
  );
}

function VideoResultCard({
  item,
  shot,
  onToggleFinal,
  isUpdatingFinal,
}: {
  item: VideoHistoryItem;
  shot: VideoShot;
  onToggleFinal: (item: VideoHistoryItem) => void;
  isUpdatingFinal: boolean;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-border bg-black"
    >
      <AspectRatio ratio={9 / 16}>
        {item.videoUrl ? (
          <VideoPreview
            shot={{ ...shot, posterUrl: item.posterUrl, videoUrl: item.videoUrl }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <PlayCircle
              size={24}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </div>
        )}
      </AspectRatio>
      {item.videoUrl && (
        <Button
          type="button"
          size="sm"
          variant={item.isFinal ? "secondary" : "outline"}
          disabled={isUpdatingFinal}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFinal(item);
          }}
          className="absolute right-2 top-2 h-7 gap-1.5 px-2 text-xs opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          {item.isFinal && <Check size={12} strokeWidth={2} />}
          {isUpdatingFinal ? "处理中" : item.isFinal ? "取消定稿" : "定稿"}
        </Button>
      )}
    </div>
  );
}

function GenerationHistory({
  historyItems,
  isLoading,
  shot,
  onToggleFinal,
  updatingFinalId,
}: {
  historyItems: VideoHistoryItem[];
  isLoading: boolean;
  shot: VideoShot;
  onToggleFinal: (item: VideoHistoryItem) => void;
  updatingFinalId: string | null;
}) {
  const selectedVideo =
    historyItems.find((item) => item.isFinal) ?? historyItems.at(-1) ?? null;

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          <div className="mb-5">
            <div className="mb-3 flex h-6 items-center">
              <p className="text-sm font-medium text-white">定稿视频</p>
            </div>

            <div>
              {isLoading ? (
                <div className="grid grid-cols-4 gap-3">
                  <AspectRatio ratio={9 / 16}>
                    <SkeletonBlock className="h-full w-full" />
                  </AspectRatio>
                </div>
              ) : selectedVideo ? (
                <div className="grid grid-cols-4 gap-3">
                  <VideoResultCard
                    item={selectedVideo}
                    shot={shot}
                    onToggleFinal={onToggleFinal}
                    isUpdatingFinal={updatingFinalId === selectedVideo.id}
                  />
                </div>
              ) : (
                <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed border-white/[0.10] bg-[#101010]">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.08]">
                      <Film
                        size={20}
                        strokeWidth={1.5}
                        className="text-[#777]"
                      />
                    </div>
                    <p className="text-sm text-[#a3a3a3]">暂无定稿视频</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex h-6 items-center justify-between">
              <p className="text-sm font-medium text-white">生成历史</p>
              <span className="text-xs text-[#777]">
                {historyItems.length} 个
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <AspectRatio key={index} ratio={9 / 16}>
                    <SkeletonBlock className="h-full w-full" />
                  </AspectRatio>
                ))}
              </div>
            ) : historyItems.length === 0 ? (
              <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed border-white/[0.10] bg-[#101010]">
                <div className="text-center">
                  <Play
                    size={20}
                    strokeWidth={1.5}
                    className="mx-auto mb-2 text-[#777]"
                  />
                  <p className="text-xs text-[#8f8f8f]">暂无生成视频</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {historyItems.map((item) => (
                  <VideoResultCard
                    key={item.id}
                    item={item}
                    shot={shot}
                    onToggleFinal={onToggleFinal}
                    isUpdatingFinal={updatingFinalId === item.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </section>
  );
}

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
                <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
                  <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/[0.12] px-4">
                    <h3 className="text-sm font-medium text-white">
                      镜头 {selectedShot.number}
                    </h3>
                    <Badge
                      variant={selectedShot.hasVideo ? "success" : "muted"}
                      className="shrink-0"
                    >
                      {selectedShot.hasVideo ? "已有视频" : "待生成"}
                    </Badge>
                  </div>

                  <ScrollArea
                    className="min-h-0 flex-1"
                    contentClassName="[&>div]:!h-full"
                  >
                    <div className="flex h-full min-h-0 flex-col p-4">
                      <textarea
                        value={selectedPrompt}
                        onChange={(event) =>
                          setPromptDrafts((drafts) => ({
                            ...drafts,
                            [selectedShot.id]: event.target.value,
                          }))
                        }
                        placeholder="描述镜头运动、角色动作、画面氛围和视频节奏"
                        className="min-h-0 w-full flex-1 resize-none rounded-md border border-white/[0.14] bg-[#101010] px-3 py-3 text-sm leading-[1.7] text-[#d8d8d8] outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#00CAE0]/60"
                      />
                    </div>
                  </ScrollArea>

                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.12] px-4 py-3">
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                      <SelectPill
                        label="模型"
                        value={selectedModel}
                        options={["Seedance 2.0"]}
                        onChange={setSelectedModel}
                        showLabel={false}
                      />
                      <div className="min-w-0">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="h-8 w-full truncate rounded-md border border-white/[0.14] bg-[#202020] px-3 text-left text-xs text-[#d8d8d8] outline-none transition-colors duration-200 hover:border-white/[0.22] focus-visible:border-[#00CAE0]/60"
                            >
                              {ParameterSummary({
                                duration: selectedDuration,
                                resolution: selectedResolution,
                                ratio: selectedRatio,
                                sound: selectedSound,
                              })}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" side="top" className="w-72">
                            <div className="grid grid-cols-2 gap-2">
                              <SelectPill
                                label="时长"
                                value={selectedDuration}
                                options={["5s", "10s"]}
                                onChange={setSelectedDuration}
                                icon={Clock}
                              />
                              <SelectPill
                                label="分辨率"
                                value={selectedResolution}
                                options={["720p", "1080p"]}
                                onChange={setSelectedResolution}
                              />
                              <SelectPill
                                label="比例"
                                value={selectedRatio}
                                options={["16:9", "9:16"]}
                                onChange={setSelectedRatio}
                              />
                              <SelectPill
                                label="声音"
                                value={selectedSound}
                                options={["有声", "无声"]}
                                onChange={setSelectedSound}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 pb-1">
                      <span className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                        <Coins
                          size={14}
                          strokeWidth={1.5}
                          className="text-[#00CAE0]"
                        />
                        {calcVideoCost(selectedDuration)} 积分
                      </span>
                      <Button size="lg">
                        <Send />
                        生成视频
                      </Button>
                    </div>
                  </div>
                </section>

                <GenerationHistory
                  historyItems={videoHistoryItems}
                  isLoading={videoHistoryLoading}
                  shot={selectedShot}
                  onToggleFinal={handleToggleFinalVideo}
                  updatingFinalId={updatingFinalId}
                />
              </div>
            )}

            <div className="shrink-0 border-t border-white/[0.12] bg-[#101010] px-5 py-3">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex items-center gap-3 pb-3">
                  {thumbnailShots.map((shot) => {
                    const active = selectedShot?.id === shot.id;
                    return (
                      <button
                        key={shot.id}
                        onClick={() => setSelectedShotId(shot.id)}
                        className="group w-40 shrink-0 text-left"
                      >
                        <AspectRatio
                          ratio={16 / 9}
                          className={`relative overflow-hidden rounded-md border transition-all duration-200 ${
                            active
                              ? "border-[#00CAE0]/70 ring-2 ring-[#00CAE0]/20"
                              : "border-white/[0.12] group-hover:border-white/[0.24]"
                          }`}
                        >
                          <StoryboardThumbnail shot={shot} />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1">
                            <span className="text-xs font-medium text-white">
                              镜头 {shot.number}
                            </span>
                            <Badge
                              variant={shot.hasVideo ? "success" : "muted"}
                              size="sm"
                            >
                              {shot.hasVideo ? "已生成" : "待生成"}
                            </Badge>
                          </div>
                        </AspectRatio>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
