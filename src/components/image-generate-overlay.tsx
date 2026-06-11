"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus,
  Send,
  Image as ImageIcon,
  Clock,
  Check,
  ChevronDown,
  User,
  Upload,
  Library,
  X,
  Search,
  Coins,
} from "lucide-react";
import { aiApi, imagesApi, assetsApi, useApi } from "@/lib/api";
import type {
  AiImageModelConfigDTO,
  ImageGenerationHistoryItem,
  ResourceTemplateAssetHistoryItem,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";
import { toast as sonnerToast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GenerationImage {
  id: string;
  name: string;
  url: string | null;
}

interface GenerationRecord {
  id: string;
  prompt: string;
  model: string;
  ratio: string;
  createdAt: string;
  images: GenerationImage[];
}

const counts = ["1 张", "2 张", "4 张"];
const countMap: Record<string, number> = { "1 张": 1, "2 张": 2, "4 张": 4 };

function parseCount(s: string): number {
  return countMap[s] ?? 1;
}

function normalizeImageUrl(url: string) {
  return url.split("#")[0]?.split("?")[0] ?? url;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

function Dropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
        {value}
        <ChevronDown size={12} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 py-1 rounded-lg border border-white/[0.14] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10 min-w-[100px]">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-200 ${opt === value ? "text-white bg-white/[0.10]" : "text-[#b8b8b8] hover:text-white hover:bg-white/[0.08]"}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  variantName: string;
  defaultPrompt?: string;
  projectId: string;
  variantId: string;
  currentImageUrls: string[];
  onImagesChange: (imageUrls: string[]) => Promise<void>;
}

function adaptHistory(items: ImageGenerationHistoryItem[]): GenerationRecord[] {
  return items.map((item) => ({
    id: `gen-${item.taskId}`,
    prompt: item.prompt ?? "",
    model: item.modelId ?? "",
    ratio: item.aspectRatio ?? "1:1",
    createdAt: item.createdTime?.slice(0, 16).replace("T", " ") ?? "",
    images: (item.imageUrls ?? []).map((url, i) => ({
      id: `gi-${item.taskId}-${i}`,
      name: `图片 ${i + 1}`,
      url,
    })),
  }));
}

function adaptAssetHistory(items: ResourceTemplateAssetHistoryItem[]): GenerationRecord[] {
  return items
    .map((item) => {
      const url = item.assetUrl ?? item.asset_url ?? item.thumbnailUrl ?? item.thumbnail_url ?? "";
      if (!url) return null;
      const id = String(item.id);
      const title = item.title ?? "本地上传";
      return {
        id: `asset-${id}`,
        prompt: title,
        model: "本地图片",
        ratio: "-",
        createdAt: (item.createTime ?? item.create_time)?.slice(0, 16).replace("T", " ") ?? "",
        images: [{
          id: `asset-img-${id}`,
          name: title,
          url,
        }],
      } satisfies GenerationRecord;
    })
    .filter((item): item is GenerationRecord => item !== null);
}

export function ImageGenerateOverlay({ open, onClose, variantName, defaultPrompt = "", projectId, variantId, currentImageUrls, onImagesChange }: Props) {
  const [prompt, setPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<number>(0);
  const [selectedRatio, setSelectedRatio] = useState("");
  const [selectedCount, setSelectedCount] = useState(counts[2]);
  const [addedImages, setAddedImages] = useState<Set<string>>(new Set(currentImageUrls));
  const [applying, setApplying] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const addedImagesRef = useRef(addedImages);
  const normalizedAddedImages = useMemo(
    () => new Set(Array.from(addedImages).map(normalizeImageUrl)),
    [addedImages],
  );

  useEffect(() => {
    addedImagesRef.current = addedImages;
  }, [addedImages]);

  // Sync addedImages with currentImageUrls only when actual URLs change
  const urlsKey = [...currentImageUrls].sort().join("|");
  const prevUrlsKey = useRef(urlsKey);
  useEffect(() => {
    if (urlsKey !== prevUrlsKey.current) {
      setAddedImages(new Set(currentImageUrls));
      prevUrlsKey.current = urlsKey;
    }
  }, [urlsKey, currentImageUrls]);
  const recordRefs = useRef<Record<string, HTMLDivElement | null>>({});


  const { data: modelList, isLoading: modelsLoading } = useApi(() => aiApi.fetchImageModels(), []);
  const models: AiImageModelConfigDTO[] = useMemo(() => modelList?.items ?? [], [modelList]);
  const selectedModel = models.find((m) => m.id === selectedModelId);
  const modelNames = models.map((m) => m.model_name);
  const ratios = selectedModel?.supported_aspect_ratios ?? [];
  const defaultRatio = ratios[0] ?? "1:1";

  const { data: historyData, refetch: refetchHistory, isLoading: historyLoading } = useApi(
    () => variantId ? imagesApi.fetchImageHistory({ businessId: variantId, pageSize: 50 }) : Promise.resolve({ list: [], total: 0 }),
    [variantId],
  );
  const { data: assetHistoryData, refetch: refetchAssetHistory, isLoading: assetHistoryLoading } = useApi(
    () => variantId ? imagesApi.fetchTemplateAssetHistory({
      resourceTempId: variantId,
      assetType: "image",
      resourceTypes: ["uploaded_image"],
      pageSize: 50,
    }) : Promise.resolve({ list: [], total: 0, page_num: 1, page_size: 50 }),
    [variantId],
  );
  const remoteHistory = useMemo(
    () => adaptHistory(historyData?.list ?? []),
    [historyData?.list],
  );
  const uploadHistory = useMemo(
    () => adaptAssetHistory(assetHistoryData?.list ?? []),
    [assetHistoryData?.list],
  );
  const history: GenerationRecord[] = useMemo(
    () => [...uploadHistory, ...remoteHistory],
    [uploadHistory, remoteHistory],
  );

  const [generating, setGenerating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || !selectedModel || generating) return;
    setGenerating(true);
    try {
      const referenceImages = refAttached.map((r) => r.coverUrl).filter(Boolean) as string[];
      const taskId = await imagesApi.createImageTask({
        prompt: prompt.trim(),
        modelBusinessType: selectedModel.id,
        modelId: selectedModel.model_id,
        aspectRatio: selectedRatio || defaultRatio,
        imageCount: parseCount(selectedCount),
        projectId,
        businessId: variantId,
        businessType: "PROJECT_ASSET",
        generationType: referenceImages.length > 0 ? "IMAGE_TO_IMAGE" : "TEXT_TO_IMAGE",
        extraParams: {
          recordAssetHistory: true,
          bindProjectAssetImage: true,
          bindTarget: "primary",
        },
        responseFormat: "url",
        referenceImages,
      });
      // Poll for completion
      pollRef.current = setInterval(async () => {
        try {
          const status = await imagesApi.fetchImageTaskStatus(String(taskId));
          const taskStatus = status.taskStatus ?? status.task_status;
          if (taskStatus === "COMPLETED" || taskStatus === "FAILED" || taskStatus === "CANCELLED") {
            if (pollRef.current) clearInterval(pollRef.current);
            setGenerating(false);
            if (taskStatus === "COMPLETED") {
              const generatedUrls = [
                ...(status.imageUrls ?? status.image_urls ?? []),
                status.imageUrl ?? status.image_url ?? "",
              ].filter(Boolean);
              if (generatedUrls.length > 0) {
                const next = new Set(addedImagesRef.current);
                generatedUrls.forEach((url) => next.add(url));
                await onImagesChange(Array.from(next));
                setAddedImages(next);
                addedImagesRef.current = next;
              }
            }
            refetchHistory();
            refetchAssetHistory();
            if (taskStatus === "COMPLETED") {
              sonnerToast.success("生成完成");
            } else {
              sonnerToast.error(status.errorMessage ?? "生成失败");
            }
          }
        } catch {
          // polling error, keep trying
        }
      }, 3000);
    } catch (error) {
      setGenerating(false);
      sonnerToast.error(getErrorMessage(error, "提交生成失败"));
    }
  }

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (models.length > 0 && selectedModelId === 0) {
      const first = models[0];
      setSelectedModelId(first.id);
      setSelectedRatio(first.supported_aspect_ratios?.[0] ?? "1:1");
    }
  }, [models, selectedModelId]);

  useEffect(() => {
    if (history.length > 0 && !activeRecordId) {
      setActiveRecordId(history[0].id);
    }
  }, [history, activeRecordId]);

  // Reference image modal
  const [refModalOpen, setRefModalOpen] = useState(false);
  const [refTab, setRefTab] = useState<"library" | "upload">("library");
  const [refSelected, setRefSelected] = useState<Set<string>>(new Set());
  const [refAttached, setRefAttached] = useState<{ id: string; name: string; coverUrl?: string | null }[]>([]);

  const { data: assetData } = useApi(
    () => assetsApi.fetchAssets({ page_size: 50 }),
    [],
  );
  const library = (assetData?.list ?? []).map((a) => ({
    id: a.id,
    name: a.resourceName,
    source: a.libraryId ? "项目元素" as const : "平台资源" as const,
    coverUrl: a.coverUrl,
  }));

  function scrollToRecord(id: string) {
    setActiveRecordId(id);
    recordRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function loadDefaultPrompt() {
    const text = defaultPrompt.trim();
    if (!text) {
      sonnerToast.error("暂无默认提示词");
      return;
    }
    setPrompt(text);
  }

  async function addUploadedFiles(files: FileList | File[]) {
    if (uploading) return;
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      sonnerToast.error("请选择图片文件");
      return;
    }

    setUploading(true);
    try {
      const urls = await imagesApi.uploadImages(imageFiles);
      await Promise.all(urls.map((url, index) => {
        const file = imageFiles[index];
        const fileName = file?.name ?? "";
        return imagesApi.createTemplateAssetHistory({
          assetType: "image",
          assetUrl: url,
          contentId: projectId,
          metadata: {
            assetName: variantName,
            fileName: fileName || undefined,
            targetType: "character",
          },
          resourceTempId: variantId,
          resourceType: "uploaded_image",
          sourceType: "local_upload",
          title: fileName ? `本地上传 ${fileName}` : `本地上传 ${variantName || "形象图"}`,
          usageType: "primary",
        });
      }));

      refetchAssetHistory();
      setRefModalOpen(false);
      setRefSelected(new Set());
      sonnerToast.success(`已上传 ${urls.length} 张图片`);
    } catch (error) {
      sonnerToast.error(getErrorMessage(error, "图片上传失败"));
    } finally {
      setUploading(false);
    }
  }

  async function toggleImage(url: string) {
    if (applying) return;
    const next = new Set(addedImages);
    const normalizedUrl = normalizeImageUrl(url);
    const existing = Array.from(next).find((item) => normalizeImageUrl(item) === normalizedUrl);
    if (existing) next.delete(existing);
    else next.add(url);
    const urls = Array.from(next);
    setApplying(true);
    try {
      await onImagesChange(urls);
      setAddedImages(next);
      addedImagesRef.current = next;
    } catch (error) {
      sonnerToast.error(getErrorMessage(error, "更新形象图失败"));
    } finally {
      setApplying(false);
    }
  }

  function toggleRefSelect(id: string) {
    setRefSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmRefSelect() {
    const newRefs = [...refAttached];
    for (const id of refSelected) {
      if (!newRefs.find((r) => r.id === id)) {
        const item = library.find((l) => l.id === id);
        if (item) newRefs.push({ id: item.id, name: item.name, coverUrl: item.coverUrl });
      }
    }
    setRefAttached(newRefs);
    setRefModalOpen(false);
    setRefSelected(new Set());
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm animate-in fade-in duration-150 ease-out">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files?.length) addUploadedFiles(files);
          event.currentTarget.value = "";
        }}
      />
      <div className="flex h-[min(860px,calc(100dvh-48px))] w-[min(1280px,calc(100vw-48px))] flex-col overflow-hidden rounded-xl border border-white/[0.14] bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        {/* Header */}
        <div className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/[0.12] px-5">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="shrink-0 text-[15px] font-medium">生成形象图</h3>
            {variantName && (
              <>
                <span className="shrink-0 text-[12px] text-[#666]">/</span>
                <span className="truncate text-[13px] text-[#a3a3a3]">{variantName}</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full text-[#a3a3a3] transition-colors duration-200 hover:bg-white/[0.10] hover:text-white">
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Main */}
        <div className="flex min-h-0 flex-1 gap-4 p-4">
          {/* Left — generation panel */}
          <div className="w-[40%] shrink-0 rounded-xl border border-white/[0.12] bg-[#181818] flex flex-col">
          <div className="px-5 pt-5 pb-2 shrink-0">
            <h3 className="text-[15px] font-medium">生成设置</h3>
          </div>
          <ScrollArea className="min-h-0 flex-1" contentClassName="[&>div]:!h-full">
          <div className="flex min-h-0 h-full flex-col">
            {/* Reference images */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.12] shrink-0">
              <p className="text-[12px] text-[#a3a3a3] mb-2">参考图</p>
              <div className="flex items-center gap-2 flex-wrap">
                {refAttached.map((ref) => (
                  <div key={ref.id} className="relative group">
                    <div className="w-20 h-20 rounded-lg bg-[#2b2b2b] border border-white/[0.12] flex items-center justify-center overflow-hidden">
                      {ref.coverUrl ? (
                        <img src={ref.coverUrl} alt={ref.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} strokeWidth={1.5} className="text-[#888]" />
                      )}
                    </div>
                    <button
                      onClick={() => setRefAttached((prev) => prev.filter((r) => r.id !== ref.id))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1c1c1c] border border-white/[0.14] flex items-center justify-center text-[#a3a3a3] opacity-0 group-hover:opacity-100 hover:text-white transition-all duration-200"
                    >
                      <X size={10} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setRefModalOpen(true)}
                  className="w-20 h-20 rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center text-[#a3a3a3] hover:border-white/[0.2] hover:text-[#b8b8b8] transition-colors duration-200"
                >
                  <Plus size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Prompt */}
            <div className="flex-1 flex flex-col p-4 min-h-0">
              <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                <p className="text-[12px] text-[#a3a3a3]">提示词</p>
                <button
                  type="button"
                  onClick={loadDefaultPrompt}
                  disabled={!defaultPrompt.trim()}
                  className="h-7 rounded-full bg-white/[0.10] px-2.5 text-[12px] text-[#b8b8b8] transition-colors duration-200 hover:bg-white/[0.1] hover:text-white disabled:pointer-events-none disabled:opacity-40"
                >
                  加载默认提示词
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的形象图..."
                className="flex-1 w-full bg-[#2b2b2b] border border-white/[0.14] rounded-lg px-3 py-2.5 text-[13px] text-[#ccc] leading-[1.7] placeholder:text-white/25 resize-none outline-none focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] transition-colors duration-200"
              />
            </div>
          </div>
          </ScrollArea>

          {/* Bottom bar */}
          <div className="shrink-0 px-4 py-3 border-t border-white/[0.12]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dropdown value={modelsLoading ? "加载中..." : (selectedModel?.model_name ?? "选择模型")} options={modelNames} onChange={(name) => { const m = models.find((x) => x.model_name === name); if (m) { setSelectedModelId(m.id); setSelectedRatio(m.supported_aspect_ratios?.[0] ?? "1:1"); } }} />
                <Dropdown value={selectedRatio || defaultRatio} options={ratios.length > 0 ? ratios : [defaultRatio]} onChange={setSelectedRatio} />
                <Dropdown value={selectedCount} options={counts} onChange={setSelectedCount} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#a3a3a3] flex items-center gap-1">
                  <Coins size={12} strokeWidth={1.5} className="text-[#00CAE0]" />
                  {Math.round((selectedModel?.cost_per_image ?? 0) * parseCount(selectedCount))} 积分
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim() || !selectedModel}
                  className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Send size={14} strokeWidth={2} />
                  {generating ? "生成中..." : "生成"}
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Right — history */}
          <div className="flex-1 rounded-xl border border-white/[0.12] bg-[#181818] flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0 mr-[56px]">
            <h3 className="text-[15px] font-medium">生成历史</h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => uploadInputRef.current?.click()}
                disabled={uploading}
                className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
              >
                <Upload size={12} strokeWidth={1.5} />
                {uploading ? "上传中..." : "上传图片"}
              </button>
              <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                <Library size={12} strokeWidth={1.5} />
                资源库导入
              </button>
            </div>
          </div>

          {historyLoading || assetHistoryLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[13px] text-[#888]">尚无生成记录</p>
            </div>
          ) : (
            <div className="flex-1 flex min-h-0">
              {/* Main scroll area */}
              <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-5 p-4">
                {history.map((record) => {
                  const img = record.images[0];
                  const isAdded = img?.url ? normalizedAddedImages.has(normalizeImageUrl(img.url)) : false;
                  return (
                    <div
                      key={record.id}
                      ref={(el) => { recordRefs.current[record.id] = el; }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[12px] text-[#b8b8b8] leading-[1.6] truncate flex-1 min-w-0 mr-3">
                          {record.prompt}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-[#b8b8b8]">{record.model}</span>
                          <span className="text-[11px] text-[#888]">·</span>
                          <span className="text-[11px] text-[#b8b8b8]">{record.ratio}</span>
                          <span className="text-[11px] text-[#888]">·</span>
                          <span className="text-[11px] text-[#888]">
                            <Clock size={9} strokeWidth={1.5} className="inline mr-0.5 -mt-px" />
                            {record.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="max-h-[320px] rounded-lg overflow-hidden border border-white/[0.12] bg-[#181818] flex items-center justify-center relative">
                        <div className="w-full aspect-[3/4] max-h-[320px] bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                          {img?.url ? (
                            <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
                          ) : (
                            <User size={40} strokeWidth={0.5} className="text-white/[0.06]" />
                          )}
                        </div>
                        {isAdded && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#00CAE0]/20 flex items-center justify-center">
                            <Check size={12} strokeWidth={2} className="text-[#00CAE0]" />
                          </div>
                        )}
                      </div>
                      {img && (
                        <div className="px-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#b8b8b8]">{img.name}</span>
                            <button
                              onClick={() => img.url && toggleImage(img.url)}
                              disabled={applying}
                              className={`h-7 px-3 rounded-full text-[11px] flex items-center gap-1 transition-colors duration-200 ${
                                isAdded ? "bg-[#00CAE0]/10 text-[#00CAE0] hover:bg-[#00CAE0]/15"
                                : "bg-white/[0.10] text-[#b8b8b8] hover:bg-white/[0.1] hover:text-white"
                              } disabled:opacity-50`}
                            >
                              {isAdded ? <><Check size={10} strokeWidth={2} />已添加</> : applying ? <>...</> : <><Plus size={10} strokeWidth={1.5} />添加为形象图</>}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[11px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                              生成三视图
                            </button>
                            <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[11px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                              超清放大
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              </ScrollArea>

              {/* Thumbnail strip */}
              <ScrollArea className="w-[56px] shrink-0">
              <div className="space-y-2 py-3 pl-1 pr-2">
                {history.map((record) => {
                  const img = record.images[0];
                  const isAdded = img?.url ? normalizedAddedImages.has(normalizeImageUrl(img.url)) : false;
                  const isActive = activeRecordId === record.id;
                  return (
                    <button
                      key={record.id}
                      onClick={() => scrollToRecord(record.id)}
                      className={`w-full aspect-[3/4] rounded-md overflow-hidden relative transition-all duration-200 ${
                        isActive
                          ? "ring-2 ring-white/30 bg-[#202020]"
                          : "opacity-50 hover:opacity-80 bg-[#202020]"
                      }`}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center">
                        {img?.url ? (
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={12} strokeWidth={1} className="text-white/[0.06]" />
                        )}
                      </div>
                      {isAdded && (
                        <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#00CAE0]" />
                      )}
                    </button>
                  );
                })}
              </div>
              </ScrollArea>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Reference image picker modal */}
      {refModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[640px] max-h-[80vh] rounded-xl border border-white/[0.14] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.12] shrink-0">
              <h3 className="text-[15px] font-medium">选择参考图</h3>
              <button onClick={() => { setRefModalOpen(false); setRefSelected(new Set()); }} className="w-7 h-7 rounded-full flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/[0.10] transition-colors duration-200">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 mx-5 mt-4 rounded-full bg-white/[0.10] shrink-0">
              <button onClick={() => setRefTab("library")} className={`flex-1 h-8 rounded-full text-[13px] flex items-center justify-center gap-1.5 transition-all duration-200 ${refTab === "library" ? "bg-white/10 text-white" : "text-[#b8b8b8] hover:text-white"}`}>
                <Library size={14} strokeWidth={1.5} />
                资源库
              </button>
              <button onClick={() => setRefTab("upload")} className={`flex-1 h-8 rounded-full text-[13px] flex items-center justify-center gap-1.5 transition-all duration-200 ${refTab === "upload" ? "bg-white/10 text-white" : "text-[#b8b8b8] hover:text-white"}`}>
                <Upload size={14} strokeWidth={1.5} />
                本地上传
              </button>
            </div>

            {/* Body */}
            <ScrollArea className="min-h-0 flex-1">
            <div className="p-5">
              {refTab === "library" ? (
                <>
                  <div className="h-8 px-3 rounded-full bg-[#2b2b2b] flex items-center gap-2 text-[12px] text-[#a3a3a3] mb-4">
                    <Search size={14} strokeWidth={1.5} />
                    搜索资源...
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {library.map((item) => {
                      const isSelected = refSelected.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleRefSelect(item.id)}
                          className={`rounded-lg overflow-hidden border transition-all duration-200 ${
                            isSelected
                              ? "border-[#00CAE0]/40 ring-1 ring-[#00CAE0]/30"
                              : "border-white/[0.12] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                          }`}
                        >
                          <div className="aspect-square bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center relative">
                            {item.coverUrl ? (
                              <img src={item.coverUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} strokeWidth={1} className="text-white/[0.06]" />
                            )}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00CAE0] flex items-center justify-center">
                                <Check size={10} strokeWidth={2} className="text-black" />
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-[#181818]">
                            <p className="text-[11px] text-[#ccc] truncate">{item.name}</p>
                            <p className="text-[10px] text-[#b8b8b8] mt-0.5">{item.source}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => uploadInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      uploadInputRef.current?.click();
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    addUploadedFiles(event.dataTransfer.files);
                  }}
                  className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/[0.1] rounded-xl hover:border-white/[0.2] transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center mb-4">
                    <Upload size={24} strokeWidth={1.5} className="text-[#a3a3a3]" />
                  </div>
                  <p className="text-[14px] text-[#b8b8b8] mb-1">{uploading ? "正在上传图片..." : "点击或拖拽图片到此区域"}</p>
                  <p className="text-[12px] text-[#b8b8b8]">支持 PNG、JPG、WebP，单张最大 10MB</p>
                </div>
              )}
            </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.12] shrink-0">
              <span className="text-[12px] text-[#a3a3a3]">
                {refSelected.size > 0 ? `已选择 ${refSelected.size} 张` : "点击图片选择"}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => { setRefModalOpen(false); setRefSelected(new Set()); }} className="h-9 px-4 rounded-full bg-white/[0.10] text-[13px] text-[#b8b8b8] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                  取消
                </button>
                <button
                  onClick={confirmRefSelect}
                  disabled={refSelected.size === 0}
                  className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus size={14} strokeWidth={2} />
                  添加 {refSelected.size > 0 ? `${refSelected.size} 张` : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
