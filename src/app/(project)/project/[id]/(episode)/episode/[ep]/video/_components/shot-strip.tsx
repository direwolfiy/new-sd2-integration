import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Download,
  Film,
  Sparkles,
  X,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getPlayableVideoUrl } from "./video-data";
import type { VideoShot } from "./types";

export function ShotStrip({
  shots,
  selectedShotId,
  onSelectShot,
  onBatchGenerateVideos,
  onBatchDownloadVideos,
  onScheduleSubmitVideos,
}: {
  shots: VideoShot[];
  selectedShotId: string | null;
  onSelectShot: (shotId: string) => void;
  onBatchGenerateVideos: (shotIds: string[]) => void;
  onBatchDownloadVideos: (shotIds: string[]) => void;
  onScheduleSubmitVideos: (shotIds: string[]) => void;
}) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedShotIds = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const hasSelection = selectedShotIds.length > 0;
  const allSelected = shots.length > 0 && selectedIds.size === shots.length;

  function selectShotForBatch(shotId: string) {
    setSelectionMode(true);
    setSelectedIds((current) => {
      const next = new Set(current);
      next.add(shotId);
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function toggleShot(shotId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(shotId)) {
        next.delete(shotId);
      } else {
        next.add(shotId);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(shots.map((shot) => shot.id)),
    );
  }

  return (
    <div className="shrink-0 border-t border-white/[0.12] bg-[#101010] px-5 py-3">
      <div className="flex min-w-0 flex-col">
        {selectionMode && (
          <div className="mb-2 flex h-7 items-center gap-1.5">
            <Badge variant="muted" size="sm" className="min-w-6 justify-center">
              {selectedIds.size}
            </Badge>
            <Button size="xs" variant="ghost" onClick={toggleAll}>
              {allSelected ? "清空" : "全选"}
            </Button>
            <Button
              size="xs"
              disabled={!hasSelection}
              onClick={() => onBatchGenerateVideos(selectedShotIds)}
            >
              <Sparkles />
              批量生成
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={!hasSelection}
              title="批量下载"
              onClick={() => onBatchDownloadVideos(selectedShotIds)}
            >
              <Download />
              批量下载
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={!hasSelection}
              title="定时提交"
              onClick={() => onScheduleSubmitVideos(selectedShotIds)}
            >
              <CalendarClock />
              定时提交
            </Button>
            <Button
              size="xs"
              variant="ghost"
              title="退出多选"
              onClick={exitSelectionMode}
            >
              <X />
              退出多选
            </Button>
          </div>
        )}

        <ScrollArea className="min-w-0 flex-1 whitespace-nowrap">
          <div className="flex items-center gap-3 pb-3">
            {shots.map((shot) => {
              const active = selectedShotId === shot.id;
              const selected = selectedIds.has(shot.id);
              return (
                <div key={shot.id} className="group relative w-40 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      selectionMode
                        ? toggleShot(shot.id)
                        : onSelectShot(shot.id)
                    }
                    className="w-full text-left"
                  >
                    <AspectRatio
                      ratio={16 / 9}
                      className={`relative overflow-hidden rounded-md border transition-all duration-200 ${
                        selected
                          ? "border-[#00CAE0]/80"
                          : active
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
                  <button
                    type="button"
                    title={selected ? "取消选择" : "选择镜头"}
                    onClick={() =>
                      selectionMode
                        ? toggleShot(shot.id)
                        : selectShotForBatch(shot.id)
                    }
                    className={`absolute left-2 top-2 z-10 flex size-5 items-center justify-center rounded-full border text-xs transition-opacity ${
                      selected
                        ? "border-[#00CAE0] bg-[#00CAE0] text-black opacity-100"
                        : selectionMode
                        ? "border-white/40 bg-black/50 text-transparent opacity-100"
                        : "border-white/40 bg-black/50 text-transparent opacity-0 hover:opacity-100 focus-visible:opacity-100"
                    }`}
                  >
                    <Check className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
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
