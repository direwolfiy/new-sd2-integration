import { useMemo, useState } from "react";
import { ImageIcon, MoreHorizontal, Plus, Users } from "lucide-react";
import { elementsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
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
  projectId,
  isLoading = false,
  onChanged,
}: {
  assets: ElementItem[];
  projectId: string;
  isLoading?: boolean;
  onChanged?: () => void;
}) {
  const [editingAsset, setEditingAsset] = useState<ElementItem | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<ElementItem | null>(null);
  const [creatingType, setCreatingType] = useState<ElementItem["type"] | null>(
    null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
      (["character", "scene", "prop", "material"] as const).map((type) => ({
      type,
      items: visible.filter((asset) => asset.type === type),
    })),
    [visible],
  );

  function openCreate(type: ElementItem["type"]) {
    setCreatingType(type);
    setEditingAsset(null);
    setDeletingAsset(null);
    setName("");
    setDescription("");
  }

  function openEdit(asset: ElementItem) {
    setEditingAsset(asset);
    setCreatingType(null);
    setDeletingAsset(null);
    setName(asset.name);
    setDescription(asset.tags.join(" / "));
  }

  async function saveAsset() {
    const assetName = name.trim();
    if (!assetName || busy) return;

    setBusy(true);
    try {
      if (editingAsset) {
        await elementsApi.updateElement(editingAsset.id, {
          template_name: assetName,
          description: description.trim() || null,
        });
      } else if (creatingType) {
        await elementsApi.createElement({
          content_id: projectId,
          template_name: assetName,
          template_type: toTemplateType(creatingType),
          description: description.trim() || null,
        });
      }
      closeEditor();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function deleteAsset() {
    if (!deletingAsset || busy) return;
    setBusy(true);
    try {
      await elementsApi.deleteElement(deletingAsset.id);
      setDeletingAsset(null);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  function closeEditor() {
    setEditingAsset(null);
    setCreatingType(null);
    setName("");
    setDescription("");
  }

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
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#777]">
                      {group.items.length}
                    </span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      title={`新增${assetLabels[group.type]}`}
                      onClick={() => openCreate(group.type)}
                    >
                      <Plus />
                    </Button>
                  </div>
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
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-[#d8d8d8]">
                            {asset.name || "未命名"}
                          </p>
                          {asset.tags.length > 0 && (
                            <p className="mt-1 truncate text-xs text-[#777]">
                              {asset.tags.join(" / ")}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              title="资产操作"
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => openEdit(asset)}>
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeletingAsset(asset)}
                              >
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog
        open={editingAsset !== null || creatingType !== null}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <DialogContent className="max-w-md bg-[#181818] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingAsset
                ? `编辑${assetLabels[editingAsset.type]}`
                : creatingType
                  ? `新增${assetLabels[creatingType]}`
                  : "资产"}
            </DialogTitle>
            <DialogDescription>
              资产会用于分镜和视频生成引用。
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="资产名称"
            />
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="描述、标签或关键特征"
              className="min-h-24"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeEditor} disabled={busy}>
              取消
            </Button>
            <Button onClick={saveAsset} disabled={!name.trim() || busy}>
              {busy ? "保存中" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingAsset !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingAsset(null);
        }}
      >
        <DialogContent className="max-w-sm bg-[#181818] text-white">
          <DialogHeader>
            <DialogTitle>删除资产</DialogTitle>
            <DialogDescription>
              删除后该资产将不再出现在本集资产列表中。
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-[#d8d8d8]">
            确认删除「{deletingAsset?.name}」？
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeletingAsset(null)}
              disabled={busy}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={deleteAsset} disabled={busy}>
              {busy ? "删除中" : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function toTemplateType(type: ElementItem["type"]) {
  if (type === "character") return "ROLE";
  if (type === "scene") return "SCENE";
  if (type === "prop") return "PROP";
  return "MATERIAL";
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
