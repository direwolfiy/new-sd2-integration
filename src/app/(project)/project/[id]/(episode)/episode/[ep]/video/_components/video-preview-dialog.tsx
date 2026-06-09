import type React from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  formatVideoDuration,
  formatVideoTime,
  getPlayableVideoUrl,
} from "./video-data";
import type { VideoHistoryItem, VideoShot } from "./types";

export function VideoPreviewDialog({
  item,
  shot,
  open,
  onOpenChange,
  onToggleFinal,
  updatingFinalId,
}: {
  item: VideoHistoryItem | null;
  shot: VideoShot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFinal: (item: VideoHistoryItem) => void;
  updatingFinalId: string | null;
}) {
  const videoUrl = item?.videoUrl ? getPlayableVideoUrl(item.videoUrl) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden bg-[#141414] p-0 text-white">
        <DialogHeader className="border-b border-white/[0.12] px-4 py-3">
          <DialogTitle>镜头 {shot?.number ?? "-"}</DialogTitle>
          <DialogDescription className="sr-only">
            视频预览与生成详情
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_18rem] gap-0">
          <div className="min-h-0 bg-black p-4">
            <AspectRatio ratio={9 / 16} className="mx-auto h-full max-h-[72vh] w-auto overflow-hidden rounded-lg bg-black">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  poster={item?.posterUrl ?? undefined}
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  暂无视频
                </div>
              )}
            </AspectRatio>
          </div>

          <aside className="flex min-h-0 flex-col border-l border-white/[0.12] bg-[#181818]">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.12] px-4 py-3">
              <Badge variant={item?.isFinal ? "success" : "muted"}>
                {item?.isFinal ? "定稿" : "历史版本"}
              </Badge>
              {item && (
                <Button
                  size="sm"
                  variant={item.isFinal ? "secondary" : "outline"}
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
              )}
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-4 p-4">
                <DetailGroup title="生成信息">
                  <DetailRow label="版本" value={item ? `V${item.version}` : "-"} />
                  <DetailRow
                    label="时长"
                    value={formatVideoDuration(item?.duration ?? shot?.duration ?? null)}
                  />
                  <DetailRow label="模型" value={item?.modelId ?? "-"} />
                  <DetailRow
                    label="生成时间"
                    value={formatVideoTime(item?.createdTime ?? item?.updateTime)}
                  />
                </DetailGroup>

                <Separator />

                <DetailGroup title="提示词">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#d8d8d8]">
                    {item?.prompt || shot?.prompt || "暂无提示词"}
                  </p>
                </DetailGroup>

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    disabled={!item?.videoUrl}
                    onClick={() => {
                      if (item?.videoUrl) void navigator.clipboard.writeText(item.videoUrl);
                    }}
                  >
                    <Copy />
                    复制链接
                  </Button>
                  <Button variant="outline" disabled={!item?.videoUrl} asChild={!!item?.videoUrl}>
                    {item?.videoUrl ? (
                      <a href={item.videoUrl} target="_blank" rel="noreferrer">
                        <ExternalLink />
                        打开
                      </a>
                    ) : (
                      <>
                        <ExternalLink />
                        打开
                      </>
                    )}
                  </Button>
                  <Button
                    className="col-span-2"
                    variant="ghost"
                    disabled={!item?.videoUrl}
                    asChild={!!item?.videoUrl}
                  >
                    {item?.videoUrl ? (
                      <a href={item.videoUrl} download>
                        <Download />
                        下载视频
                      </a>
                    ) : (
                      <>
                        <Download />
                        下载视频
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-white">{title}</h3>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[#8f8f8f]">{label}</span>
      <span className="truncate text-[#d8d8d8]">{value}</span>
    </div>
  );
}
