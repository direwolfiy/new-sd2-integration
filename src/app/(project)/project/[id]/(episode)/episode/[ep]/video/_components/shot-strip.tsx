import { Film } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getPlayableVideoUrl } from "./video-data";
import type { VideoShot } from "./types";

export function ShotStrip({
  shots,
  selectedShotId,
  onSelectShot,
}: {
  shots: VideoShot[];
  selectedShotId: string | null;
  onSelectShot: (shotId: string) => void;
}) {
  return (
    <div className="shrink-0 border-t border-white/[0.12] bg-[#101010] px-5 py-3">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-3 pb-3">
          {shots.map((shot) => {
            const active = selectedShotId === shot.id;
            return (
              <button
                key={shot.id}
                onClick={() => onSelectShot(shot.id)}
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
