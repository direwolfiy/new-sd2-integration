import { useRef, useState } from "react";
import { Check, Film, Play, PlayCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatVideoDuration,
  getPlayableVideoUrl,
} from "./video-data";
import type { VideoHistoryItem, VideoShot } from "./types";
import { SkeletonBlock } from "./skeleton-block";

export function GenerationHistory({
  historyItems,
  isLoading,
  shot,
  onToggleFinal,
  updatingFinalId,
  onPreview,
}: {
  historyItems: VideoHistoryItem[];
  isLoading: boolean;
  shot: VideoShot;
  onToggleFinal: (item: VideoHistoryItem) => void;
  updatingFinalId: string | null;
  onPreview: (item: VideoHistoryItem) => void;
}) {
  const selectedVideo = historyItems.find((item) => item.isFinal) ?? null;

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
                    onPreview={onPreview}
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
                    onPreview={onPreview}
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

function VideoResultCard({
  item,
  shot,
  onToggleFinal,
  isUpdatingFinal,
  onPreview,
}: {
  item: VideoHistoryItem;
  shot: VideoShot;
  onToggleFinal: (item: VideoHistoryItem) => void;
  isUpdatingFinal: boolean;
  onPreview: (item: VideoHistoryItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPreview(item)}
      className="group relative overflow-hidden rounded-lg border border-border bg-black text-left outline-none transition-colors hover:border-white/[0.24] focus-visible:ring-2 focus-visible:ring-ring/50"
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
    </button>
  );
}

function VideoPreview({ shot }: { shot: VideoShot }) {
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
        <Play size={24} strokeWidth={1.5} className="text-[#00CAE0]" />
      ) : (
        <span className="text-sm text-muted-foreground">暂无视频</span>
      )}
    </div>
  );
}
