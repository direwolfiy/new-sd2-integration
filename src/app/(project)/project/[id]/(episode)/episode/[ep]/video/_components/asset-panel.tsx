import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ImageIcon,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { adaptElements } from "@/lib/adapters";
import { elementsApi, useApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ElementItem } from "@/mocks/types";
import { SkeletonBlock } from "./skeleton-block";

type AssetPickerType = Extract<
  ElementItem["type"],
  "character" | "scene" | "prop" | "material"
>;

const assetLabels: Record<ElementItem["type"], string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  material: "素材",
  audio: "音频",
  script: "剧本",
};

const pickerTypes: Array<{
  type: AssetPickerType;
  templateType: string;
  icon: typeof Users;
}> = [
  { type: "character", templateType: "ROLE", icon: Users },
  { type: "scene", templateType: "SCENE", icon: ImageIcon },
  { type: "prop", templateType: "PROP", icon: Package },
  { type: "material", templateType: "MATERIAL", icon: ImageIcon },
];

export function AssetPanel({
  assets,
  projectId,
  episodeId,
  isLoading = false,
  onChanged,
}: {
  assets: ElementItem[];
  projectId: string;
  episodeId: string;
  isLoading?: boolean;
  onChanged?: () => void;
}) {
  const [pickerType, setPickerType] = useState<AssetPickerType | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [removingAsset, setRemovingAsset] = useState<ElementItem | null>(null);
  const [busy, setBusy] = useState(false);

  const visible = useMemo(
    () =>
      assets.filter(
        (asset) => asset.type !== "script" && asset.type !== "audio",
      ),
    [assets],
  );
  const groups = useMemo(
    () =>
      pickerTypes.map(({ type }) => ({
        type,
        items: visible.filter((asset) => asset.type === type),
      })),
    [visible],
  );

  const activePicker = pickerTypes.find((item) => item.type === pickerType);
  const {
    data: rawLibraryAssets,
    isLoading: libraryLoading,
    refetch: refetchLibraryAssets,
  } = useApi(
    () =>
      activePicker
        ? elementsApi.fetchUnreferencedElements(
            projectId,
            episodeId,
            activePicker.templateType,
          )
        : Promise.resolve([]),
    [projectId, episodeId, activePicker?.templateType],
  );
  const libraryAssets = useMemo(
    () => adaptElements(rawLibraryAssets ?? []),
    [rawLibraryAssets],
  );
  const filteredLibraryAssets = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return libraryAssets;
    return libraryAssets.filter((asset) =>
      [asset.name, asset.tags.join(" ")].some((text) =>
        text.toLowerCase().includes(keyword),
      ),
    );
  }, [libraryAssets, query]);

  useEffect(() => {
    setSelectedIds(new Set());
    setQuery("");
  }, [pickerType]);

  function openPicker(type: AssetPickerType) {
    setPickerType(type);
    setRemovingAsset(null);
  }

  function closePicker() {
    setPickerType(null);
    setSelectedIds(new Set());
    setQuery("");
  }

  function toggleSelection(templateId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  }

  async function bindSelectedAssets() {
    if (!pickerType || selectedIds.size === 0 || busy) return;

    setBusy(true);
    try {
      await elementsApi.batchBindElements({
        content_id: projectId,
        chapter_id: episodeId,
        bindings: Array.from(selectedIds).map((templateId) => ({
          resource_temp_id: templateId,
          type: 1,
        })),
      });
      closePicker();
      refetchLibraryAssets();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function removeFromEpisode() {
    const bindingId = removingAsset?.bindingId;
    if (!bindingId || busy) return;

    setBusy(true);
    try {
      await elementsApi.deleteSceneRole(bindingId);
      setRemovingAsset(null);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex min-h-0 w-64 shrink-0 flex-col border-r border-white/[0.12] bg-[#101010]">
      <div className="flex h-11 items-center justify-between border-b border-white/[0.12] px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-white">本集资产</h2>
          <Badge variant="muted" size="sm">
            {visible.length}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost" title="添加本集资产">
              <Plus />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {pickerTypes.map(({ type, icon: Icon }) => (
                <DropdownMenuItem key={type} onClick={() => openPicker(type)}>
                  <Icon />
                  {assetLabels[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
                      <AssetRow
                        key={`${group.type}:${asset.templateId ?? asset.id}`}
                        asset={asset}
                        fallbackType={group.type}
                        onRemove={() => setRemovingAsset(asset)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog
        open={pickerType !== null}
        onOpenChange={(open) => {
          if (!open) closePicker();
        }}
      >
        <DialogContent className="grid h-[calc(100dvh-2rem)] max-h-[640px] max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden bg-[#181818] p-0 text-white">
          <DialogHeader className="border-b border-white/[0.12] px-4 py-3">
            <DialogTitle className="text-sm">
              选择{pickerType ? assetLabels[pickerType] : "资产"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-col gap-3 overflow-hidden px-4 py-3">
            <div className="flex items-center gap-2 rounded-md border border-white/[0.12] bg-[#101010] px-3">
              <Search className="size-4 text-[#777]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索项目库元素"
                className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              {query ? (
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setQuery("")}
                  title="清空搜索"
                >
                  <X />
                </Button>
              ) : null}
            </div>
            <ScrollArea className="h-full min-h-0 max-h-[calc(100dvh-11rem)]">
              {libraryLoading ? (
                <AssetPickerSkeleton />
              ) : filteredLibraryAssets.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center rounded-lg border border-white/[0.08] text-sm text-[#777]">
                  暂无可添加的{pickerType ? assetLabels[pickerType] : "资产"}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pb-1">
                  {filteredLibraryAssets.map((asset) => {
                    const templateId = asset.templateId ?? asset.id;
                    const selected = selectedIds.has(templateId);
                    return (
                      <button
                        key={templateId}
                        type="button"
                        onClick={() => toggleSelection(templateId)}
                        className="flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.10] bg-[#101010] p-2 text-left transition-colors hover:border-white/[0.18] hover:bg-white/[0.05] data-[selected=true]:border-[#00CAE0]/50 data-[selected=true]:bg-[#00CAE0]/10"
                        data-selected={selected}
                      >
                        <AssetThumb
                          asset={asset}
                          fallbackType={asset.type as AssetPickerType}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[#e8e8e8]">
                            {asset.name || "未命名"}
                          </p>
                          {asset.tags.length > 0 ? (
                            <p className="mt-1 truncate text-xs text-[#777]">
                              {asset.tags.join(" / ")}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border border-white/[0.16] text-transparent",
                            selected &&
                              "border-[#00CAE0] bg-[#00CAE0] text-black",
                          )}
                        >
                          <Check
                            className="size-3"
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter className="border-t border-white/[0.12] px-4 py-3">
            <Button variant="ghost" onClick={closePicker} disabled={busy}>
              取消
            </Button>
            <Button
              onClick={bindSelectedAssets}
              disabled={selectedIds.size === 0 || busy}
            >
              {busy ? "添加中" : `添加 ${selectedIds.size || ""}`.trim()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={removingAsset !== null}
        onOpenChange={(open) => {
          if (!open) setRemovingAsset(null);
        }}
      >
        <DialogContent className="max-w-sm bg-[#181818] text-white">
          <DialogHeader>
            <DialogTitle>移出本集资产</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#d8d8d8]">
            确认将「{removingAsset?.name}」从本集资产中移出？
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRemovingAsset(null)}
              disabled={busy}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={removeFromEpisode}
              disabled={busy}
            >
              {busy ? "移出中" : "移出"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function AssetRow({
  asset,
  fallbackType,
  onRemove,
}: {
  asset: ElementItem;
  fallbackType: AssetPickerType;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-[#181818] p-2">
      <AssetThumb asset={asset} fallbackType={fallbackType} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-[#d8d8d8]">
          {asset.name || "未命名"}
        </p>
        {asset.tags.length > 0 ? (
          <p className="mt-1 truncate text-xs text-[#777]">
            {asset.tags.join(" / ")}
          </p>
        ) : null}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-xs" variant="ghost" title="资产操作">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              移出本集
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AssetThumb({
  asset,
  fallbackType,
}: {
  asset: Pick<ElementItem, "thumbnailUrl">;
  fallbackType: AssetPickerType;
}) {
  const Icon = fallbackType === "character" ? Users : ImageIcon;

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#2b2b2b]">
      {asset.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <Icon size={16} className="text-[#888]" />
      )}
    </div>
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

function AssetPickerSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-white/[0.10] bg-[#101010] p-2"
        >
          <SkeletonBlock className="h-9 w-9 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
