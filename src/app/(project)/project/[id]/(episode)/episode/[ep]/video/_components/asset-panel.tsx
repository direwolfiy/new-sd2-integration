import { ImageIcon, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ElementItem } from "@/mocks/types";
import { SkeletonBlock } from "./skeleton-block";

const assetLabels: Record<ElementItem["type"], string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  material: "素材",
  audio: "音频",
  script: "剧本",
};

export function AssetPanel({
  assets,
  isLoading = false,
}: {
  assets: ElementItem[];
  isLoading?: boolean;
}) {
  const visible = assets.filter(
    (asset) => asset.type !== "script" && asset.type !== "audio",
  );
  const groups = (["character", "scene", "prop", "material"] as const).map(
    (type) => ({
      type,
      items: visible.filter((asset) => asset.type === type),
    }),
  );

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
