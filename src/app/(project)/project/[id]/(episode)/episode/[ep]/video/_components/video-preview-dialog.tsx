import {
  Check,
  Download,
  Film,
  Music,
  RotateCcw,
  Scissors,
  Sparkles,
  Upload,
  Volume2,
  WandSparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatVideoDuration,
  getPlayableVideoUrl,
} from "./video-data";
import type { VideoHistoryItem, VideoShot } from "./types";

export function VideoPreviewDialog({
  item,
  shot,
  shots,
  historyItems,
  previewShotId,
  open,
  onOpenChange,
  onSelectShot,
  onSelectVersion,
  onToggleFinal,
  updatingFinalId,
}: {
  item: VideoHistoryItem | null;
  shot: VideoShot | null;
  shots: VideoShot[];
  historyItems: VideoHistoryItem[];
  previewShotId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectShot: (shotId: string) => void;
  onSelectVersion: (item: VideoHistoryItem) => void;
  onToggleFinal: (item: VideoHistoryItem) => void;
  updatingFinalId: string | null;
}) {
  const videoUrl = item?.videoUrl ? getPlayableVideoUrl(item.videoUrl) : null;
  const activeShotId = previewShotId ?? shot?.id ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100dvh-1rem)] max-h-none w-[calc(100vw-1rem)] max-w-none overflow-hidden border-white/[0.08] bg-[#0f0f10] p-0 text-white [&>button]:hidden">
        <DialogTitle className="sr-only">
          镜头 {shot?.number ?? "-"} 视频预览
        </DialogTitle>
        <DialogDescription className="sr-only">
          全屏视频预览、镜头切换与历史版本切换
        </DialogDescription>

        <div className="grid h-full min-h-0 grid-cols-[4.5rem_minmax(0,1fr)_25rem] bg-[#0f0f10]">
          <ShotRail
            shots={shots}
            activeShotId={activeShotId}
            onSelectShot={onSelectShot}
          />

          <main className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#111112]">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-4 z-20 bg-white/[0.06] text-white hover:bg-white/[0.12]"
              title="关闭"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </Button>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-8 pb-4 pt-10">
              <div className="flex max-h-full max-w-full items-center justify-center rounded-lg bg-black shadow-2xl">
                <div className="aspect-[9/16] max-h-[calc(100dvh-13rem)] max-w-[min(72vw,calc((100dvh-13rem)*9/16))] overflow-hidden rounded-lg bg-black">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      poster={item?.posterUrl ?? undefined}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full min-w-72 items-center justify-center text-sm text-muted-foreground">
                      暂无视频
                    </div>
                  )}
                </div>
              </div>
            </div>

            <VersionDock
              items={historyItems}
              activeItemId={item?.id ?? null}
              onSelectVersion={onSelectVersion}
            />
          </main>

          <InfoPanel
            item={item}
            shot={shot}
            onToggleFinal={onToggleFinal}
            updatingFinalId={updatingFinalId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShotRail({
  shots,
  activeShotId,
  onSelectShot,
}: {
  shots: VideoShot[];
  activeShotId: string | null;
  onSelectShot: (shotId: string) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-white/[0.08] bg-[#0c0c0d] py-3">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col items-center gap-2 px-2">
          {shots.map((shot) => {
            const active = shot.id === activeShotId;
            return (
              <button
                key={shot.id}
                type="button"
                onClick={() => onSelectShot(shot.id)}
                className="group w-full rounded-lg p-1 transition-colors hover:bg-white/[0.06] data-[active=true]:bg-white/[0.10]"
                data-active={active}
                title={`镜头 ${shot.number}`}
              >
                <div className="relative aspect-video overflow-hidden rounded-md border border-white/[0.10] bg-[#181818] data-[active=true]:border-[#00CAE0]/70">
                  <ShotThumb shot={shot} />
                </div>
                <p className="mt-1 truncate text-center text-[11px] text-[#8f8f8f] group-data-[active=true]:text-white">
                  {shot.number}
                </p>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

function ShotThumb({ shot }: { shot: VideoShot }) {
  if (shot.posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={shot.posterUrl} alt="" className="h-full w-full object-cover" />
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
      <Film size={16} strokeWidth={1.5} className="text-muted-foreground" />
    </div>
  );
}

function VersionDock({
  items,
  activeItemId,
  onSelectVersion,
}: {
  items: VideoHistoryItem[];
  activeItemId: string | null;
  onSelectVersion: (item: VideoHistoryItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex shrink-0 justify-center px-8 pb-5 pt-1">
      <ScrollArea className="max-w-[min(48rem,calc(100vw-34rem))] rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          {items.map((historyItem) => {
            const active = historyItem.id === activeItemId;
            return (
              <button
                key={historyItem.id}
                type="button"
                onClick={() => onSelectVersion(historyItem)}
                className="group relative h-24 w-14 shrink-0 overflow-hidden rounded-md border border-white/[0.14] bg-[#181818] text-left transition-colors hover:border-white/[0.28] data-[active=true]:border-[#00CAE0]/80 data-[active=true]:ring-2 data-[active=true]:ring-[#00CAE0]/25"
                data-active={active}
                title={`V${historyItem.version}`}
              >
                <VersionThumb item={historyItem} />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  V{historyItem.version}
                </span>
                {historyItem.isFinal ? (
                  <Badge
                    variant="success"
                    size="sm"
                    className="absolute right-1 bottom-1 text-[10px]"
                  >
                    定稿
                  </Badge>
                ) : null}
                {active ? (
                  <span className="absolute inset-x-1 bottom-1 h-0.5 rounded-full bg-[#00CAE0]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function VersionThumb({ item }: { item: VideoHistoryItem }) {
  if (item.posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.posterUrl} alt="" className="h-full w-full object-cover" />
    );
  }

  if (item.videoUrl) {
    return (
      <video
        src={getPlayableVideoUrl(item.videoUrl)}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Film size={16} strokeWidth={1.5} className="text-muted-foreground" />
    </div>
  );
}

function InfoPanel({
  item,
  shot,
  onToggleFinal,
  updatingFinalId,
}: {
  item: VideoHistoryItem | null;
  shot: VideoShot | null;
  onToggleFinal: (item: VideoHistoryItem) => void;
  updatingFinalId: string | null;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-l border-white/[0.08] bg-[#101012]">
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4">
        {item ? (
          <Button
            variant="default"
            size="sm"
            disabled={updatingFinalId === item.id}
            onClick={() => onToggleFinal(item)}
          >
            {item.isFinal && <Check />}
            {updatingFinalId === item.id
              ? "处理中"
              : item.isFinal
                ? "取消定稿"
                : "设为定稿"}
          </Button>
        ) : (
          <Button variant="default" size="sm" disabled>
            设为定稿
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <Download />
            下载
          </Button>
          <Button variant="ghost" size="icon-sm" disabled title="收藏">
            <Sparkles />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled title="分享">
            <Upload />
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-5">
          <div>
            <p className="mb-3 text-xs text-[#777]">视频提示词</p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#e0e0e0]">
              {item?.prompt || shot?.prompt || "暂无提示词"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#777]">
              <span>{item?.modelId ?? "Seedance 2.0"}</span>
              <span>|</span>
              <span>{formatVideoDuration(item?.duration ?? shot?.duration ?? null)}</span>
              <span>|</span>
              <span>详细信息</span>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="shrink-0 space-y-3 border-t border-white/[0.08] p-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/[0.07] p-3">
          <DisabledTool icon={Scissors} label="对口型" />
          <DisabledTool icon={Volume2} label="AI音效" />
          <DisabledTool icon={Music} label="AI配乐" />
          <DisabledTool icon={WandSparkles} label="补帧" accent />
          <DisabledTool icon={Sparkles} label="智能超清" accent />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" disabled>
            重新编辑
          </Button>
          <Button variant="secondary" disabled>
            <RotateCcw />
            再次生成
          </Button>
        </div>
      </div>
    </aside>
  );
}

function DisabledTool({
  icon: Icon,
  label,
  accent = false,
}: {
  icon: typeof Scissors;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md px-2 text-xs text-[#b8b8b8] opacity-70"
    >
      <Icon
        className={accent ? "size-3.5 text-[#00CAE0]" : "size-3.5 text-[#d8d8d8]"}
      />
      {label}
    </button>
  );
}
