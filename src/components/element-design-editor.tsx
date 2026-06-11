"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MoreHorizontal, Mountain, Package, Plus, Star, Trash2, User } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { elementsApi, episodesApi, useApi } from "@/lib/api";
import type { SceneRoleItem } from "@/lib/api/types";
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ImageGenerateOverlay } from "./image-generate-overlay";

type DesignType = "character" | "scene" | "prop";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  initialId: string;
  initialType: DesignType;
  roles: SceneRoleItem[];
  onRefresh: () => void;
}

interface DesignItem {
  key: string;
  type: DesignType;
  name: string;
  records: SceneRoleItem[];
  coverImage: string | null;
  description: string;
  tags: string[];
  episodeIds: string[];
}

const typeTabs: { key: DesignType; label: string; icon: typeof User }[] = [
  { key: "character", label: "角色", icon: User },
  { key: "scene", label: "场景", icon: Mountain },
  { key: "prop", label: "道具", icon: Package },
];

const typeLabel: Record<DesignType, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
};

const templateTypeValue: Record<DesignType, string> = {
  character: "ROLE",
  scene: "SCENE",
  prop: "PROP",
};

function getDesignType(templateType: string | null | undefined): DesignType | null {
  const value = (templateType ?? "").toUpperCase();
  if (value === "ROLE" || value === "CHARACTER") return "character";
  if (value === "SCENE") return "scene";
  if (value === "PROP" || value === "PROPS") return "prop";
  return null;
}

function getAppearance(item: SceneRoleItem) {
  return item.appearance as Record<string, unknown> | null;
}

function extractCharacterName(name: string) {
  const idx = name.indexOf("-");
  return idx > 0 ? name.slice(0, idx) : name;
}

function getVariantDisplayName(item: SceneRoleItem) {
  const templateName = item.template_name ?? "";
  const appName = String(getAppearance(item)?.name ?? "");
  if (!appName) return templateName;
  const roleName = extractCharacterName(templateName);
  if (!roleName || appName.startsWith(`${roleName}-`)) return appName;
  return `${roleName}-${appName}`;
}

function getRecordName(item: SceneRoleItem) {
  const type = getDesignType(item.template_type);
  if (type === "character") return extractCharacterName(item.template_name ?? "");
  return item.template_name ?? "未命名";
}

function getRecordCover(item: SceneRoleItem): string | null {
  const images = getAppearance(item)?.images as string[] | undefined;
  return images?.[0] ?? item.cover_image ?? null;
}

function normalizeImageUrl(url: string) {
  return url.split("#")[0]?.split("?")[0] ?? url;
}

function sameImageList(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((url, index) => normalizeImageUrl(url) === normalizeImageUrl(b[index] ?? ""));
}

function getEffectiveImages(item: SceneRoleItem): string[] {
  const images = ((getAppearance(item)?.images as string[] | undefined) ?? []).filter(Boolean);
  const cover = item.cover_image;
  if (!cover) return images;
  return images.some((url) => normalizeImageUrl(url) === normalizeImageUrl(cover))
    ? images
    : [cover, ...images];
}

function getDefaultImagePrompt(item: SceneRoleItem) {
  const appearance = getAppearance(item) ?? {};
  const metadata = (item.template_metadata as Record<string, unknown> | null) ?? {};
  const candidates = [
    metadata.seedanceImagePrompt,
    appearance.imagePrompt,
    appearance.image_prompt,
  ];
  for (const candidate of candidates) {
    const text = typeof candidate === "string" ? candidate.trim() : "";
    if (text) return text;
  }
  const nestedSources = [
    appearance.seedanceAppearances,
    metadata.seedanceAppearances,
    (item as unknown as Record<string, unknown>).seedanceAppearances,
  ];
  for (const source of nestedSources) {
    if (!Array.isArray(source)) continue;
    for (const item of source) {
      const text = typeof item === "object" && item !== null
        ? String((item as Record<string, unknown>).imagePrompt ?? (item as Record<string, unknown>).image_prompt ?? "").trim()
        : "";
      if (text) return text;
    }
  }
  return String(appearance.description ?? item.description ?? "").trim();
}

function getRecordTags(item: SceneRoleItem): string[] {
  const meta = item.template_metadata as Record<string, unknown> | null;
  const metaTags = meta?.tags as string[] | undefined;
  return metaTags ?? ([item.role_type, item.template_category].filter(Boolean) as string[]);
}

function buildDesignItems(roles: SceneRoleItem[]): DesignItem[] {
  const map = new Map<string, DesignItem>();

  for (const role of roles) {
    const type = getDesignType(role.template_type);
    if (!type) continue;

    const name = getRecordName(role);
    const key = type === "character" ? `${type}:${name}` : `${type}:${role.id}`;
    const chapterId = role.chapter_id ? String(role.chapter_id) : null;
    const existing = map.get(key);

    if (existing) {
      existing.records.push(role);
      if (chapterId && !existing.episodeIds.includes(chapterId)) {
        existing.episodeIds.push(chapterId);
      }
      continue;
    }

    map.set(key, {
      key,
      type,
      name,
      records: [role],
      coverImage: getRecordCover(role),
      description: role.description ?? "",
      tags: getRecordTags(role),
      episodeIds: chapterId ? [chapterId] : [],
    });
  }

  return Array.from(map.values());
}

function getItemForInitialId(items: DesignItem[], id: string, type: DesignType) {
  return items.find((item) =>
    item.type === type && item.records.some((record) => String(record.id) === id),
  );
}

export function ElementDesignEditor({
  open,
  onClose,
  projectId,
  initialId,
  initialType,
  roles,
  onRefresh,
}: Props) {
  const items = useMemo(() => buildDesignItems(roles), [roles]);
  const [activeType, setActiveType] = useState<DesignType>(initialType);
  const [selectedKey, setSelectedKey] = useState("");
  const [episodeFilter, setEpisodeFilter] = useState("all");
  const [generateVariantId, setGenerateVariantId] = useState<string | null>(null);
  const [generateVariantSnapshot, setGenerateVariantSnapshot] = useState<SceneRoleItem | null>(null);
  const [editingInfoItem, setEditingInfoItem] = useState<DesignItem | null>(null);
  const [editingVariant, setEditingVariant] = useState<SceneRoleItem | null>(null);
  const [addingType, setAddingType] = useState<DesignType | null>(null);
  const [infoDraftName, setInfoDraftName] = useState("");
  const [infoDraftDesc, setInfoDraftDesc] = useState("");
  const [variantDraftName, setVariantDraftName] = useState("");
  const [variantDraftTags, setVariantDraftTags] = useState("");
  const [variantDraftDesc, setVariantDraftDesc] = useState("");
  const [addDraftName, setAddDraftName] = useState("");
  const [addDraftDesc, setAddDraftDesc] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [initializedFor, setInitializedFor] = useState("");
  const [blockedInitialKey, setBlockedInitialKey] = useState("");

  const { data: chapters } = useApi(
    () => episodesApi.fetchChapters(projectId),
    [projectId],
  );

  useEffect(() => {
    if (!open) return;
    const key = `${initialType}:${initialId}`;
    const initial = getItemForInitialId(items, initialId, initialType);
    if (initializedFor === key) {
      if (!selectedKey && initial) {
        setActiveType(initial.type);
        setSelectedKey(initial.key);
        setBlockedInitialKey("");
      }
      return;
    }
    setActiveType(initial?.type ?? initialType);
    setSelectedKey(initial ? initial.key : "");
    setBlockedInitialKey(initial ? "" : key);
    setEpisodeFilter("all");
    setInitializedFor(key);
  }, [initialId, initialType, initializedFor, items, open, selectedKey]);

  useEffect(() => {
    if (open) return;
    setInitializedFor("");
  }, [open]);

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (item.type !== activeType) return false;
        if (episodeFilter === "all") return true;
        return item.episodeIds.includes(episodeFilter);
      }),
    [activeType, episodeFilter, items],
  );

  useEffect(() => {
    if (!open) return;
    if (!selectedKey && blockedInitialKey === `${initialType}:${initialId}`) return;
    if (visibleItems.some((item) => item.key === selectedKey)) return;
    setSelectedKey(visibleItems[0]?.key ?? "");
  }, [blockedInitialKey, initialId, initialType, open, selectedKey, visibleItems]);

  const selectedItem =
    visibleItems.find((item) => item.key === selectedKey) ??
    items.find((item) => item.key === selectedKey) ??
    null;

  const liveGenerateVariant = useMemo(
    () => items.flatMap((item) => item.records).find((record) => String(record.id) === generateVariantId) ?? null,
    [generateVariantId, items],
  );
  const generateVariant = liveGenerateVariant ?? generateVariantSnapshot;

  useEffect(() => {
    if (!generateVariantId) {
      setGenerateVariantSnapshot(null);
      return;
    }
    if (liveGenerateVariant) {
      const snapshotImages = (getAppearance(generateVariantSnapshot ?? liveGenerateVariant)?.images as string[] | undefined) ?? [];
      const liveImages = (getAppearance(liveGenerateVariant)?.images as string[] | undefined) ?? [];
      if (generateVariantSnapshot && snapshotImages.length > 0 && !sameImageList(snapshotImages, liveImages)) {
        return;
      }
      setGenerateVariantSnapshot(liveGenerateVariant);
    }
  }, [generateVariantId, generateVariantSnapshot, liveGenerateVariant]);

  function openInfoEditor(item: DesignItem) {
    setEditingInfoItem(item);
    setInfoDraftName(item.name);
    setInfoDraftDesc(item.description || item.records[0]?.description || "");
  }

  function openVariantEditor(variant: SceneRoleItem) {
    const app = getAppearance(variant);
    setEditingVariant(variant);
    setVariantDraftName(String(app?.name ?? variant.template_name?.split("-").slice(1).join("-") ?? ""));
    setVariantDraftTags((app?.tags as string[] | undefined)?.join(", ") ?? "");
    setVariantDraftDesc(String(app?.description ?? variant.description ?? ""));
  }

  function openAddDialog(type: DesignType) {
    setAddingType(type);
    setAddDraftName("");
    setAddDraftDesc("");
  }

  async function saveInfoEdit() {
    if (!editingInfoItem) return;
    const target = editingInfoItem.records[0];
    const templateId = String(target.resource_temp_id ?? target.id);
    setSavingInfo(true);
    try {
      await elementsApi.updateElement(templateId, {
        template_name: infoDraftName.trim() || editingInfoItem.name,
        description: infoDraftDesc,
      });
      onRefresh();
      setEditingInfoItem(null);
      sonnerToast.success("保存成功");
    } catch {
      sonnerToast.error("保存失败");
    } finally {
      setSavingInfo(false);
    }
  }

  async function saveVariantEdit() {
    if (!editingVariant || !selectedItem) return;
    const templateId = String(editingVariant.resource_temp_id ?? editingVariant.id);
    const tags = variantDraftTags.split(/[,，、]/).map((tag) => tag.trim()).filter(Boolean);
    setSavingInfo(true);
    try {
      await elementsApi.updateElement(templateId, {
        template_name: `${selectedItem.name}-${variantDraftName.trim() || "默认形象"}`,
        description: variantDraftDesc,
        appearance: {
          ...(getAppearance(editingVariant) ?? {}),
          name: variantDraftName.trim() || "默认形象",
          description: variantDraftDesc,
          tags,
        },
      });
      onRefresh();
      setEditingVariant(null);
      sonnerToast.success("保存成功");
    } catch {
      sonnerToast.error("保存失败");
    } finally {
      setSavingInfo(false);
    }
  }

  async function createElementItem() {
    if (!addingType) return;
    const name = addDraftName.trim();
    if (!name) return;
    setSavingInfo(true);
    try {
      if (addingType === "character" && selectedItem?.type === "character") {
        await elementsApi.createCharacter(projectId, {
          templateName: `${selectedItem.name}-${name}`,
          contentId: projectId,
          description: addDraftDesc,
        });
      } else {
        await elementsApi.createElement({
          template_name: name,
          template_type: templateTypeValue[addingType],
          content_id: projectId,
          description: addDraftDesc,
        });
      }
      onRefresh();
      setAddingType(null);
      sonnerToast.success(`已新增${addingType === "character" ? "形象" : typeLabel[addingType]}`);
    } catch {
      sonnerToast.error("新增失败");
    } finally {
      setSavingInfo(false);
    }
  }

  async function deleteRecord(record: SceneRoleItem) {
    const type = getDesignType(record.template_type);
    const id = String(record.resource_temp_id ?? record.id);
    try {
      if (type === "character") {
        await elementsApi.deleteSceneRole(String(record.id));
      } else {
        await elementsApi.deleteElement(id);
      }
      onRefresh();
      sonnerToast.success("已删除");
    } catch {
      sonnerToast.error("删除失败");
    }
  }

  async function setPrimaryImage(variant: SceneRoleItem, imageIdx: number) {
    const images = getEffectiveImages(variant);
    if (images.length <= 1 || imageIdx === 0) return;
    const reordered = [images[imageIdx], ...images.filter((_, i) => i !== imageIdx)];
    const templateId = String(variant.resource_temp_id ?? variant.id);
    await elementsApi.updateElement(templateId, {
      appearance: { ...(getAppearance(variant) ?? {}), images: reordered },
      cover_image: reordered[0],
    });
    onRefresh();
    sonnerToast.success("已设为主图");
  }

  async function handleImagesChange(imageUrls: string[]) {
    if (!generateVariant) return;
    const templateId = String(generateVariant.resource_temp_id ?? generateVariant.id);
    const nextAppearance = { ...(getAppearance(generateVariant) ?? {}), images: imageUrls };
    await elementsApi.updateElement(templateId, {
      appearance: nextAppearance,
      cover_image: imageUrls[0] ?? "",
    });
    setGenerateVariantSnapshot((prev) =>
      prev && String(prev.id) === String(generateVariant.id)
        ? { ...prev, appearance: nextAppearance, cover_image: imageUrls[0] ?? prev.cover_image }
        : prev,
    );
    onRefresh();
    sonnerToast.success(imageUrls.length > 0 ? "已更新形象图" : "已移除形象图");
  }

  if (!open) return null;


  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
      <div className="grid h-14 shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border px-6">
        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="justify-start text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          返回
        </Button>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm font-medium">资产设计</span>
            {selectedItem && (
              <>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="truncate text-sm text-muted-foreground">{selectedItem.name}</span>
              </>
            )}
          </div>
        </div>

      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex h-full w-52 shrink-0 flex-col border-r border-border">
          <div className="shrink-0 p-3">
            <div className="space-y-2 border-b border-border pb-3">
              <Tabs value={activeType} onValueChange={(value) => {
                setBlockedInitialKey("");
                setActiveType(value as DesignType);
              }}>
                <TabsList className="grid h-8 w-full grid-cols-3 rounded-full px-1 py-0.5">
                  {typeTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className="h-7 rounded-full px-2 text-xs"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Select value={episodeFilter} onValueChange={setEpisodeFilter}>
                <SelectTrigger className="h-8 w-full rounded-full text-xs">
                  <SelectValue placeholder="全部分集" />
                </SelectTrigger>
                <SelectContent align="start" className="min-w-36">
                  <SelectItem value="all">全部分集</SelectItem>
                  {(chapters ?? [])
                    .slice()
                    .sort((a, b) => a.chapterOrder - b.chapterOrder)
                    .map((chapter) => (
                      <SelectItem key={chapter.id} value={String(chapter.id)}>
                        第 {chapter.chapterOrder} 集
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <nav className="px-3 pb-3">
            <div className="space-y-1.5">
              {visibleItems.map((item) => (
                <ElementListItem
                  key={item.key}
                  item={item}
                  active={item.key === selectedKey}
                  onClick={() => setSelectedKey(item.key)}
                />
              ))}
              {visibleItems.length === 0 && (
                <div className="px-2 py-8 text-center text-xs text-muted-foreground">
                  暂无{typeLabel[activeType]}
                </div>
              )}
            </div>
            </nav>
          </ScrollArea>
        </aside>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-6">
            {selectedItem ? (
              <ElementDetail
                item={selectedItem}
                onEditInfo={openInfoEditor}
                onAddItem={openAddDialog}
                onGenerateImage={(id) => setGenerateVariantId(id)}
                onEditVariant={openVariantEditor}
                onSetPrimaryImage={setPrimaryImage}
                onDeleteRecord={deleteRecord}
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                请选择一个元素
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <ImageGenerateOverlay
        open={generateVariantId !== null}
        onClose={() => setGenerateVariantId(null)}
        variantName={generateVariant ? getVariantDisplayName(generateVariant) : ""}
        defaultPrompt={generateVariant ? getDefaultImagePrompt(generateVariant) : ""}
        projectId={projectId}
        variantId={generateVariant?.resource_temp_id ?? generateVariant?.id ?? generateVariantId ?? ""}
        currentImageUrls={generateVariant ? getEffectiveImages(generateVariant) : []}
        onImagesChange={handleImagesChange}
      />

      <Dialog open={editingInfoItem !== null} onOpenChange={(open) => !open && setEditingInfoItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑{editingInfoItem ? typeLabel[editingInfoItem.type] : "元素"}信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">名称</label>
              <Input value={infoDraftName} onChange={(event) => setInfoDraftName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">描述</label>
              <Textarea value={infoDraftDesc} onChange={(event) => setInfoDraftDesc(event.target.value)} className="min-h-28 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditingInfoItem(null)}>
              取消
            </Button>
            <Button type="button" onClick={saveInfoEdit} disabled={savingInfo}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editingVariant !== null} onOpenChange={(open) => !open && setEditingVariant(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑形象信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">形象名称</label>
              <Input value={variantDraftName} onChange={(event) => setVariantDraftName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">标签</label>
              <Input value={variantDraftTags} onChange={(event) => setVariantDraftTags(event.target.value)} placeholder="多个标签用逗号分隔" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">形象描述</label>
              <Textarea value={variantDraftDesc} onChange={(event) => setVariantDraftDesc(event.target.value)} className="min-h-28 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditingVariant(null)}>
              取消
            </Button>
            <Button type="button" onClick={saveVariantEdit} disabled={savingInfo}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addingType !== null} onOpenChange={(open) => !open && setAddingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              新增{addingType === "character" ? "形象" : addingType ? typeLabel[addingType] : "元素"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">名称</label>
              <Input value={addDraftName} onChange={(event) => setAddDraftName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">描述</label>
              <Textarea value={addDraftDesc} onChange={(event) => setAddDraftDesc(event.target.value)} className="min-h-28 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setAddingType(null)}>
              取消
            </Button>
            <Button type="button" onClick={createElementItem} disabled={savingInfo || !addDraftName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ElementListItem({
  item,
  active,
  onClick,
}: {
  item: DesignItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.type === "character" ? User : item.type === "scene" ? Mountain : Package;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg border px-2 py-2 text-left transition-all duration-200",
        active
          ? "border-border bg-muted text-foreground"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
      )}
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.name}
            className={cn("absolute inset-0 h-full w-full object-cover", item.type === "character" && "object-top")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon size={16} strokeWidth={1} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-current">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{typeLabel[item.type]}</p>
      </div>
    </button>
  );
}

function ElementDetail({
  item,
  onEditInfo,
  onAddItem,
  onGenerateImage,
  onEditVariant,
  onSetPrimaryImage,
  onDeleteRecord,
}: {
  item: DesignItem;
  onEditInfo: (item: DesignItem) => void;
  onAddItem: (type: DesignType) => void;
  onGenerateImage: (id: string) => void;
  onEditVariant: (variant: SceneRoleItem) => void;
  onSetPrimaryImage: (variant: SceneRoleItem, imageIdx: number) => void;
  onDeleteRecord: (record: SceneRoleItem) => void;
}) {
  const first = item.records[0];
  return (
    <div className="w-full space-y-4">
      <section className="rounded-xl border border-white/[0.12] p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-lg font-medium">{item.name}</h2>
              <Badge variant="muted">{typeLabel[item.type]}</Badge>
            </div>
            {item.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="muted" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => onEditInfo(item)} className="shrink-0 text-xs">
            编辑{typeLabel[item.type]}信息
          </Button>
        </div>
        <div className="mt-4 max-w-3xl">
          <span className="text-xs text-muted-foreground">{typeLabel[item.type]}描述</span>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">{item.description || first.description || "暂无"}</p>
        </div>
      </section>

      {item.type === "character" ? (
        <CharacterVariants
          records={item.records}
          onAddVariant={() => onAddItem("character")}
          onGenerateImage={onGenerateImage}
          onEditVariant={onEditVariant}
          onSetPrimaryImage={onSetPrimaryImage}
          onDeleteVariant={onDeleteRecord}
        />
      ) : (
        <StaticElementAssets
          item={item}
          onAddItem={() => onAddItem(item.type)}
          onDeleteRecord={onDeleteRecord}
        />
      )}
    </div>
  );
}

function CharacterVariants({
  records,
  onAddVariant,
  onGenerateImage,
  onEditVariant,
  onSetPrimaryImage,
  onDeleteVariant,
}: {
  records: SceneRoleItem[];
  onAddVariant: () => void;
  onGenerateImage: (id: string) => void;
  onEditVariant: (variant: SceneRoleItem) => void;
  onSetPrimaryImage: (variant: SceneRoleItem, imageIdx: number) => void;
  onDeleteVariant: (variant: SceneRoleItem) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">形象资产</h3>
      </div>
      {records.map((record) => {
        const app = getAppearance(record);
        const appName = String(app?.name ?? record.template_name?.split("-").slice(1).join("-") ?? "默认形象");
        const displayImages = getEffectiveImages(record);

        return (
          <div key={record.id} className="rounded-xl border border-white/[0.12] bg-[#181818] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{appName}</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => onEditVariant(record)} className="text-xs">
                  编辑形象信息
                </Button>
                <Button type="button" size="sm" onClick={() => onGenerateImage(String(record.id))} className="text-xs">
                  修改形象图
                </Button>
                <MoreActionMenu
                  label="删除形象"
                  onDelete={() => onDeleteVariant(record)}
                />
              </div>
            </div>
            <ScrollArea className="whitespace-nowrap pb-2">
              <div className="flex gap-4">
                {displayImages.length > 0 ? (
                  displayImages.map((imgUrl, idx) => (
                    <div
                      key={`${record.id}-${idx}`}
                      onClick={() => onGenerateImage(String(record.id))}
                      className="group relative inline-block w-36 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/[0.12] bg-[#0a0a0a] transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                    >
                      <div className="relative aspect-[9/16]">
                        <img src={imgUrl} alt={`${appName} ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover object-top" />
                        {idx === 0 ? (
                          <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary/20">
                            <Star size={10} strokeWidth={1.5} className="fill-primary text-primary" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSetPrimaryImage(record, idx);
                            }}
                            className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          >
                            <Star size={10} strokeWidth={1.5} className="text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => onGenerateImage(String(record.id))}
                    className="flex aspect-[9/16] w-36 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.12] bg-[#101010] text-xs text-muted-foreground transition-colors duration-200 hover:border-white/[0.2] hover:text-foreground"
                  >
                    <Plus className="size-4" />
                    添加形象图
                  </button>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
      <Button type="button" variant="outline" className="h-11 w-full border-dashed text-xs" onClick={onAddVariant}>
        <Plus className="size-4" />
        添加形象
      </Button>
    </section>
  );
}

function StaticElementAssets({
  item,
  onAddItem,
  onDeleteRecord,
}: {
  item: DesignItem;
  onAddItem: () => void;
  onDeleteRecord: (record: SceneRoleItem) => void;
}) {
  const Icon = item.type === "scene" ? Mountain : Package;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{typeLabel[item.type]}资产</h3>
      </div>
      {item.records.map((record) => {
        const app = getAppearance(record);
        const images = (app?.images as string[] | undefined) ?? [];
        const displayImages = images.length > 0 ? images : record.cover_image ? [record.cover_image] : [];
        const recordName = String(app?.name ?? record.template_name ?? item.name);

        return (
          <div key={record.id} className="rounded-xl border border-white/[0.12] bg-[#181818] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{recordName}</span>
              <MoreActionMenu
                label={`删除${typeLabel[item.type]}`}
                onDelete={() => onDeleteRecord(record)}
              />
            </div>
            {displayImages.length > 0 ? (
              <ScrollArea className="whitespace-nowrap pb-2">
                <div className="flex gap-4">
                  {displayImages.map((imgUrl, idx) => (
                    <div
                      key={`${record.id}-${idx}`}
                      className={cn(
                        "group relative inline-block shrink-0 overflow-hidden rounded-lg border border-white/[0.12] bg-[#0a0a0a] transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]",
                        item.type === "scene" ? "w-60" : "w-36",
                      )}
                    >
                      <div className={cn("relative", item.type === "scene" ? "aspect-video" : "aspect-square")}>
                        <img src={imgUrl} alt={`${recordName} ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-white/[0.12] text-sm text-muted-foreground">
                <Icon className="mr-2 size-4" />
                暂无图片
              </div>
            )}
            {app && typeof app === "object" && Object.keys(app).length > 0 && (
              <div className="mt-3 rounded-lg bg-white/[0.04] p-4">
                <pre className="whitespace-pre-wrap break-words text-xs leading-7 text-muted-foreground">
                  {JSON.stringify(app, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
      {item.records.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/[0.12] text-sm text-muted-foreground">
          暂无{typeLabel[item.type]}
        </div>
      )}
      <Button type="button" variant="outline" className="h-11 w-full border-dashed text-xs" onClick={onAddItem}>
        <Plus className="size-4" />
        添加{typeLabel[item.type]}
      </Button>
    </section>
  );
}

function MoreActionMenu({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-3.5" />
          {label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
