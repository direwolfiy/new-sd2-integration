"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { BookOpen, Film } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import {
  aiApi,
  episodesApi,
  imagesApi,
  scriptsApi,
  shotsApi,
  useApi,
  videosApi,
} from "@/lib/api";
import { adaptSeedanceAssets, getChapterContent } from "@/lib/adapters";
import { useParams } from "next/navigation";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import {
  adaptImageHistory,
  adaptVideoHistory,
  fetchShotPreviewMap,
  getFinalVideoMap,
  normalizeVideoShot,
} from "./_components/video-data";
import type {
  ImageHistoryItem,
  ShotPreviewMap,
  VideoHistoryItem,
} from "./_components/types";
import { AssetPanel } from "./_components/asset-panel";
import { SkeletonBlock } from "./_components/skeleton-block";
import {
  GenerationHistory,
  ImageGenerationHistory,
} from "./_components/video-results";
import { ShotStrip } from "./_components/shot-strip";
import { PromptPanel } from "./_components/prompt-panel";
import {
  adaptVideoModelOptions,
  DEFAULT_VIDEO_CHANNEL,
  DEFAULT_VIDEO_MODEL,
  getOptionValue,
} from "./_components/video-options";
import { VideoPreviewDialog } from "./_components/video-preview-dialog";

type GenerationMode = "storyboard" | "video";
const STORYBOARD_IMAGE_BUSINESS_TYPE = "scene_script_prompt_image";
type StoryboardImagePrompt = {
  id: string;
  sceneScriptId: string;
  prompt: string;
  imageUrl: string | null;
  aspectRatio: string | null;
};

function VideoWorkspaceSkeleton() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)] gap-4 overflow-hidden p-4">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.12] px-4">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <SkeletonBlock className="mb-3 h-6 w-20" />
          <SkeletonBlock className="min-h-96 flex-1" />
        </div>
        <div className="grid shrink-0 grid-cols-4 gap-2 border-t border-white/[0.12] px-4 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock className="h-3 w-10" />
              <SkeletonBlock className="h-8 w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-white/[0.12] bg-[#181818]">
        <div className="p-4">
          <SkeletonBlock className="mb-3 h-6 w-20" />
          <div className="mb-5 grid grid-cols-4 gap-3">
            <AspectRatio ratio={9 / 16}>
              <SkeletonBlock className="h-full w-full" />
            </AspectRatio>
          </div>
          <SkeletonBlock className="mb-3 h-6 w-20" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <AspectRatio key={index} ratio={9 / 16}>
                <SkeletonBlock className="h-full w-full" />
              </AspectRatio>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ShotStripSkeleton() {
  return (
    <div className="shrink-0 border-t border-white/[0.12] bg-[#101010] px-5 py-3">
      <div className="flex items-center gap-3 pb-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-40 shrink-0">
            <AspectRatio ratio={16 / 9}>
              <SkeletonBlock className="h-full w-full" />
            </AspectRatio>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeTextTab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-11 items-center text-sm transition-colors",
        active
          ? "font-medium text-white"
          : "font-normal text-[#8f8f8f] hover:text-[#d8d8d8]",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#00CAE0] transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}

export default function VideoPage() {
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>("video");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_VIDEO_MODEL.id);
  const [selectedChannel, setSelectedChannel] = useState(
    DEFAULT_VIDEO_CHANNEL.id,
  );
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [selectedSound, setSelectedSound] = useState("有声");
  const [selectedImageModelId, setSelectedImageModelId] = useState<
    number | null
  >(null);
  const [selectedImageRatio, setSelectedImageRatio] = useState("16:9");
  const [selectedImageCount, setSelectedImageCount] = useState("1");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<VideoHistoryItem | null>(null);
  const [previewShotId, setPreviewShotId] = useState<string | null>(null);
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({});
  const [storyboardPromptDrafts, setStoryboardPromptDrafts] = useState<
    Record<string, string>
  >({});
  const [storyboardReferenceDrafts, setStoryboardReferenceDrafts] = useState<
    Record<string, string[]>
  >({});
  const [uploadingStoryboardReferences, setUploadingStoryboardReferences] =
    useState(false);
  const [submittingStoryboard, setSubmittingStoryboard] = useState(false);
  const [finalVideoOverrides, setFinalVideoOverrides] = useState<
    Record<string, string | null>
  >({});
  const [updatingFinalId, setUpdatingFinalId] = useState<string | null>(null);
  const [finalImageOverrides, setFinalImageOverrides] = useState<
    Record<string, string | null>
  >({});
  const [updatingFinalImageId, setUpdatingFinalImageId] = useState<
    string | null
  >(null);

  const { data: chapter } = useApi(
    () => episodesApi.fetchChapter(episodeId),
    [episodeId],
  );
  const { data: storyboardData, isLoading: shotsLoading } = useApi(
    () => shotsApi.fetchSeedanceScripts(episodeId, true),
    [episodeId],
  );
  const { data: finalVideoData } = useApi(
    () => shotsApi.fetchChapterScripts(episodeId),
    [episodeId],
  );
  const { data: sceneScriptPrompts } = useApi(
    () => scriptsApi.fetchSceneScriptPrompts(episodeId),
    [episodeId],
  );
  const {
    data: rawAssets,
    isLoading: assetsLoading,
    refetch: refetchAssets,
  } = useApi(
    () => shotsApi.fetchSeedanceAssets(episodeId, projectId),
    [episodeId, projectId],
  );
  const { data: rawModelData } = useApi(
    () => aiApi.fetchAvailableVideoModelsByBusinessType(5),
    [],
  );
  const { data: rawImageModelData } = useApi(() => aiApi.fetchImageModels(), []);
  const imageModels = useMemo(
    () => rawImageModelData?.items ?? [],
    [rawImageModelData?.items],
  );
  const selectedImageModel =
    imageModels.find((model) => model.id === selectedImageModelId) ??
    imageModels[0] ??
    null;

  const modelOptions = useMemo(
    () => adaptVideoModelOptions(rawModelData),
    [rawModelData],
  );
  const selectedModelOption = useMemo(
    () =>
      modelOptions.find((model) => model.id === selectedModel) ??
      modelOptions[0] ??
      DEFAULT_VIDEO_MODEL,
    [modelOptions, selectedModel],
  );
  const selectedChannelOption = useMemo(
    () =>
      selectedModelOption.channels.find(
        (channel) => channel.id === selectedChannel,
      ) ??
      selectedModelOption.channels[0] ??
      DEFAULT_VIDEO_CHANNEL,
    [selectedChannel, selectedModelOption],
  );
  useEffect(() => {
    if (!modelOptions.some((model) => model.id === selectedModel)) {
      setSelectedModel(modelOptions[0]?.id ?? DEFAULT_VIDEO_MODEL.id);
    }
  }, [modelOptions, selectedModel]);
  useEffect(() => {
    if (
      !selectedModelOption.channels.some(
        (channel) => channel.id === selectedChannel,
      )
    ) {
      setSelectedChannel(
        selectedModelOption.channels[0]?.id ?? DEFAULT_VIDEO_CHANNEL.id,
      );
    }
  }, [selectedChannel, selectedModelOption]);
  useEffect(() => {
    setSelectedDuration((value) =>
      getOptionValue(value, selectedChannelOption.durations),
    );
    setSelectedResolution((value) =>
      getOptionValue(value, selectedChannelOption.resolutions),
    );
    setSelectedRatio((value) =>
      getOptionValue(value, selectedChannelOption.supportedRatios),
    );
    setSelectedSound((value) =>
      getOptionValue(value, selectedChannelOption.soundOptions),
    );
  }, [selectedChannelOption]);
  useEffect(() => {
    if (!imageModels.length) return;
    if (!selectedImageModelId) {
      setSelectedImageModelId(imageModels[0].id);
    }
  }, [imageModels, selectedImageModelId]);
  useEffect(() => {
    if (!selectedImageModel) return;
    const ratios = selectedImageModel.supported_aspect_ratios ?? [];
    if (ratios.length > 0 && !ratios.includes(selectedImageRatio)) {
      setSelectedImageRatio(ratios[0]);
    }
  }, [selectedImageModel, selectedImageRatio]);
  const assets = useMemo(
    () => adaptSeedanceAssets(rawAssets ?? []),
    [rawAssets],
  );
  const shots = useMemo(
    () => (storyboardData?.scripts ?? []).map(normalizeVideoShot),
    [storyboardData],
  );
  const finalVideoMap = useMemo(
    () => getFinalVideoMap(finalVideoData),
    [finalVideoData],
  );
  const videoShots = useMemo(
    () =>
      shots.map((shot) => {
        const finalVideoUrl =
          finalVideoOverrides[shot.id] === undefined
            ? (finalVideoMap[shot.id] ?? null)
            : finalVideoOverrides[shot.id];

        return {
          ...shot,
          finalVideoUrl,
          hasVideo: Boolean(finalVideoUrl ?? shot.videoUrl ?? shot.hasVideo),
        };
      }),
    [finalVideoMap, finalVideoOverrides, shots],
  );
  const shotPreviewKey = useMemo(
    () => videoShots.map((shot) => `${shot.id}:${shot.hasVideo ? 1 : 0}`).join("|"),
    [videoShots],
  );
  const { data: shotPreviewMap } = useApi(
    () =>
      videoShots.length
        ? fetchShotPreviewMap(videoShots)
        : Promise.resolve({} as ShotPreviewMap),
    [shotPreviewKey],
  );
  const thumbnailShots = useMemo(
    () =>
      videoShots.map((shot) => ({
        ...shot,
        posterUrl: shotPreviewMap?.[shot.id]?.posterUrl ?? shot.posterUrl,
        videoUrl: shotPreviewMap?.[shot.id]?.videoUrl ?? shot.videoUrl,
      })),
    [shotPreviewMap, videoShots],
  );
  const selectedShotBase = useMemo(
    () =>
      videoShots.find((shot) => shot.id === selectedShotId) ??
      videoShots[0] ??
      null,
    [selectedShotId, videoShots],
  );
  const selectedShot = useMemo(() => {
    if (!selectedShotBase) return null;
    const override = finalVideoOverrides[selectedShotBase.id];
    if (override === undefined) return selectedShotBase;
    return {
      ...selectedShotBase,
      finalVideoUrl: override,
      hasVideo: Boolean(override ?? selectedShotBase.videoUrl),
    };
  }, [finalVideoOverrides, selectedShotBase]);
  const imagePromptIndex = useMemo(() => {
    const byScriptId = new Map<string, StoryboardImagePrompt>();

    for (const item of sceneScriptPrompts ?? []) {
      const sceneScriptId = String(item.sceneScriptId ?? item.scene_script_id ?? "");
      const promptId = item.id == null ? "" : String(item.id);
      if (!sceneScriptId || !promptId) continue;
      const type = item.type ?? null;
      const frameType = item.imgFrameType ?? item.img_frame_type ?? null;
      const parentPromptId = item.parentPromptId ?? item.parent_prompt_id;
      if (parentPromptId != null && String(parentPromptId).trim()) continue;
      if (type != null && type !== 1) continue;
      if (frameType != null && frameType !== 1) continue;
      const prompt = {
        id: promptId,
        sceneScriptId,
        prompt: item.aiVideoPrompt ?? item.ai_video_prompt ?? "",
        imageUrl: item.videoFirstImg ?? item.video_first_img ?? null,
        aspectRatio: item.aspectRatio ?? item.aspect_ratio ?? null,
      };

      if (!byScriptId.has(sceneScriptId)) byScriptId.set(sceneScriptId, prompt);
    }

    return { byScriptId };
  }, [sceneScriptPrompts]);
  const selectedImagePrompt = selectedShot
    ? (imagePromptIndex.byScriptId.get(selectedShot.id) ?? null)
    : null;

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "development" ||
      !selectedShot ||
      selectedImagePrompt ||
      !sceneScriptPrompts
    ) {
      return;
    }

    console.warn("[video-page] storyboard image prompt not matched", {
      selectedShot: {
        id: selectedShot.id,
        number: selectedShot.number,
        description: selectedShot.description?.slice(0, 80),
      },
      episodeId,
      directMatchRequired: "resource_scene_script_prompt.scene_script_id === selectedShot.id",
      promptCount: sceneScriptPrompts.length,
      promptSamples: sceneScriptPrompts.slice(0, 5).map((item, index) => ({
        index: index + 1,
        id: item.id,
        sceneScriptId: item.sceneScriptId ?? item.scene_script_id,
        type: item.type,
        imgFrameType: item.imgFrameType ?? item.img_frame_type,
        parentPromptId: item.parentPromptId ?? item.parent_prompt_id,
      })),
    });
  }, [episodeId, sceneScriptPrompts, selectedImagePrompt, selectedShot]);
  const selectedFinalImageUrl =
    selectedImagePrompt == null
      ? null
      : finalImageOverrides[selectedImagePrompt.id] === undefined
        ? selectedImagePrompt.imageUrl
        : finalImageOverrides[selectedImagePrompt.id];
  const selectedDisplayShot = useMemo(
    () =>
      selectedShot && selectedFinalImageUrl
        ? { ...selectedShot, posterUrl: selectedFinalImageUrl }
        : selectedShot,
    [selectedFinalImageUrl, selectedShot],
  );
  useEffect(() => {
    if (selectedImagePrompt?.aspectRatio) {
      setSelectedImageRatio(selectedImagePrompt.aspectRatio);
    }
  }, [selectedImagePrompt?.aspectRatio]);
  const { data: rawVideoHistory, isLoading: videoHistoryLoading } = useApi(
    () =>
      selectedShot
        ? videosApi.fetchVideoHistory({
            businessId: selectedShot.id,
            pageSize: 50,
          })
        : Promise.resolve({ list: [], total: 0, page_num: 1, page_size: 50 }),
    [selectedShot?.id],
  );
  const selectedPrompt =
    selectedShot == null
      ? ""
      : (promptDrafts[selectedShot.id] ?? selectedShot.prompt);
  const selectedStoryboardPrompt =
    selectedShot == null
      ? ""
      : (storyboardPromptDrafts[selectedShot.id] ?? "");
  const selectedStoryboardReferences =
    selectedShot == null ? [] : (storyboardReferenceDrafts[selectedShot.id] ?? []);
  const videoHistoryItems = useMemo(
    () => (selectedShot ? adaptVideoHistory(rawVideoHistory, selectedShot) : []),
    [rawVideoHistory, selectedShot],
  );
  const {
    data: rawImageHistory,
    isLoading: imageHistoryLoading,
    refetch: refetchImageHistory,
  } = useApi(
    () =>
      selectedImagePrompt
        ? imagesApi.fetchImageHistory({
            businessId: selectedImagePrompt.id,
            businessType: STORYBOARD_IMAGE_BUSINESS_TYPE,
            forStoryboard: true,
            pageSize: 50,
          })
        : Promise.resolve({ list: [], total: 0, page_num: 1, page_size: 50 }),
    [selectedImagePrompt?.id],
  );
  const imageHistoryItems = useMemo(
    () => adaptImageHistory(rawImageHistory),
    [rawImageHistory],
  );
  useEffect(() => {
    if (!previewOpen) return;
    if (!previewItem) {
      setPreviewItem(videoHistoryItems[0] ?? null);
      return;
    }
    const stillExists = videoHistoryItems.some((item) => item.id === previewItem.id);
    if (!stillExists) {
      setPreviewItem(videoHistoryItems[0] ?? null);
    }
  }, [previewItem, previewOpen, videoHistoryItems]);
  const hasScript = !!getChapterContent(chapter).trim();

  async function handleStoryboardReferenceUpload(files: FileList | File[]) {
    if (!selectedShot || uploadingStoryboardReferences) return;
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!imageFiles.length) {
      sonnerToast.error("请选择图片文件");
      return;
    }

    setUploadingStoryboardReferences(true);
    try {
      const urls = await imagesApi.uploadImages(imageFiles);
      setStoryboardReferenceDrafts((drafts) => ({
        ...drafts,
        [selectedShot.id]: [...(drafts[selectedShot.id] ?? []), ...urls],
      }));
      sonnerToast.success(`已上传 ${urls.length} 张参考图`);
    } catch (error) {
      sonnerToast.error("参考图上传失败", {
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    } finally {
      setUploadingStoryboardReferences(false);
    }
  }

  function handleStoryboardReferenceRemove(url: string) {
    if (!selectedShot) return;
    setStoryboardReferenceDrafts((drafts) => ({
      ...drafts,
      [selectedShot.id]: (drafts[selectedShot.id] ?? []).filter(
        (item) => item !== url,
      ),
    }));
  }

  async function handleGenerateStoryboardImage() {
    if (!selectedShot || submittingStoryboard) return;
    if (!selectedImagePrompt) {
      const promptCount = sceneScriptPrompts?.length ?? 0;
      if (process.env.NODE_ENV === "development") {
        console.warn("[video-page] cannot generate storyboard image without prompt", {
          selectedShot: {
            id: selectedShot.id,
            number: selectedShot.number,
          },
          shotIndex:
            videoShots.findIndex((shot) => shot.id === selectedShot.id) + 1,
          promptScriptIds: Array.from(imagePromptIndex.byScriptId.keys()).slice(0, 10),
          promptCount,
          directMatchRequired:
            "resource_scene_script_prompt.scene_script_id === selectedShot.id",
        });
      }
      sonnerToast.error("未找到该镜头的分镜图提示词", {
        description:
          promptCount === 0
            ? "当前章节没有返回任何图片 prompt，请检查后端 prompt 同步或接口数据源"
            : "后端缺少与当前镜头 scene_script_id 直接关联的图片 prompt",
      });
      return;
    }
    if (!selectedStoryboardPrompt.trim()) {
      sonnerToast.error("请先输入分镜图提示词");
      return;
    }
    if (!selectedImageModel) {
      sonnerToast.error("暂无可用图片模型");
      return;
    }

    setSubmittingStoryboard(true);
    try {
      await imagesApi.createImageTask({
        prompt: selectedStoryboardPrompt.trim(),
        modelBusinessType: selectedImageModel.id,
        modelId: selectedImageModel.model_id,
        aspectRatio: selectedImageRatio,
        imageCount: Number(selectedImageCount),
        projectId,
        businessId: selectedImagePrompt.id,
        businessType: STORYBOARD_IMAGE_BUSINESS_TYPE,
        generationType:
          selectedStoryboardReferences.length > 0
            ? "IMAGE_TO_IMAGE"
            : "TEXT_TO_IMAGE",
        responseFormat: "url",
        referenceImages: selectedStoryboardReferences,
        extraParams: {
          sceneScriptId: selectedShot.id,
        },
      });
      sonnerToast.success("已提交分镜图生成");
      await refetchImageHistory();
    } catch (error) {
      sonnerToast.error("分镜图生成提交失败", {
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    } finally {
      setSubmittingStoryboard(false);
    }
  }

  async function handleToggleFinalImage(item: ImageHistoryItem) {
    if (
      !selectedImagePrompt ||
      !item.imageUrl ||
      updatingFinalImageId
    ) {
      return;
    }

    setUpdatingFinalImageId(item.id);
    const previousImageUrl = selectedFinalImageUrl ?? null;
    const nextImageUrl =
      selectedFinalImageUrl && item.imageUrl === selectedFinalImageUrl
        ? null
        : item.imageUrl;

    setFinalImageOverrides((overrides) => ({
      ...overrides,
      [selectedImagePrompt.id]: nextImageUrl,
    }));

    try {
      await scriptsApi.updateSceneScriptPromptFirstImage(
        selectedImagePrompt.id,
        nextImageUrl,
      );
    } catch (error) {
      setFinalImageOverrides((overrides) => ({
        ...overrides,
        [selectedImagePrompt.id]: previousImageUrl,
      }));
      sonnerToast.error(
        nextImageUrl ? "设置定稿分镜图失败" : "取消定稿分镜图失败",
        {
          description:
            error instanceof Error ? error.message : "请稍后重试",
        },
      );
    } finally {
      setUpdatingFinalImageId(null);
    }
  }

  async function handleToggleFinalVideo(item: VideoHistoryItem) {
    if (!selectedShot || !item.videoUrl || updatingFinalId) return;

    setUpdatingFinalId(item.id);
    const previousVideoUrl = selectedShot.finalVideoUrl ?? null;
    const nextVideoUrl = item.isFinal ? null : item.videoUrl;
    setFinalVideoOverrides((overrides) => ({
      ...overrides,
      [selectedShot.id]: nextVideoUrl,
    }));
    setPreviewItem((current) =>
      current?.id === item.id
        ? { ...current, isFinal: !item.isFinal }
        : current,
    );
    try {
      await videosApi.updateScriptVideoResultUrl(selectedShot.id, {
        videoResultUrl: nextVideoUrl,
      });
    } catch (error) {
      setFinalVideoOverrides((overrides) => ({
        ...overrides,
        [selectedShot.id]: previousVideoUrl,
      }));
      setPreviewItem((current) =>
        current?.id === item.id
          ? { ...current, isFinal: item.isFinal }
          : current,
      );
      sonnerToast.error(
        item.isFinal ? "取消定稿失败" : "设置定稿失败",
        {
          description:
            error instanceof Error ? error.message : "请稍后重试",
        },
      );
    } finally {
      setUpdatingFinalId(null);
    }
  }

  if (!hasScript) {
    const storyboardHref = `/project/${projectId}/episode/${episodeId}/storyboard`;
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
            <BookOpen size={24} strokeWidth={1.5} className="text-[#777]" />
          </div>
          <p className="text-base text-[#a3a3a3]">该分集尚无剧本</p>
          <Link
            href={storyboardHref}
            className="mt-1 flex h-10 items-center rounded-full bg-white px-6 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            前往分镜
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <AssetPanel
        assets={assets}
        projectId={projectId}
        episodeId={episodeId}
        isLoading={assetsLoading}
        onChanged={refetchAssets}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-11 items-center border-b border-white/[0.12] px-6">
          <div className="flex items-center gap-5">
            <ModeTextTab
              active={generationMode === "storyboard"}
              onClick={() => setGenerationMode("storyboard")}
            >
              分镜图生成
            </ModeTextTab>
            <ModeTextTab
              active={generationMode === "video"}
              onClick={() => setGenerationMode("video")}
            >
              视频生成
            </ModeTextTab>
          </div>
        </div>

        {shotsLoading ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <VideoWorkspaceSkeleton />
            <ShotStripSkeleton />
          </div>
        ) : shots.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
              <Film size={24} strokeWidth={1.5} className="text-[#777]" />
            </div>
            <p className="text-base text-[#a3a3a3]">请先完成分镜</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {selectedShot && (
              <div className="grid min-h-0 flex-1 grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)] gap-4 overflow-hidden p-4">
                <PromptPanel
                  mode={generationMode}
                  selectedShot={selectedDisplayShot ?? selectedShot}
                  selectedPrompt={
                    generationMode === "storyboard"
                      ? selectedStoryboardPrompt
                      : selectedPrompt
                  }
                  referenceImages={selectedStoryboardReferences}
                  uploadingReferences={uploadingStoryboardReferences}
                  imageModels={imageModels}
                  selectedImageModelId={selectedImageModelId ?? undefined}
                  selectedImageRatio={selectedImageRatio}
                  selectedImageCount={selectedImageCount}
                  submitting={submittingStoryboard}
                  selectedModel={selectedModel}
                  selectedChannel={selectedChannel}
                  modelOptions={modelOptions}
                  selectedModelOption={selectedModelOption}
                  selectedChannelOption={selectedChannelOption}
                  selectedDuration={selectedDuration}
                  selectedResolution={selectedResolution}
                  selectedRatio={selectedRatio}
                  selectedSound={selectedSound}
                  onPromptChange={(value) =>
                    generationMode === "storyboard"
                      ? setStoryboardPromptDrafts((drafts) => ({
                          ...drafts,
                          [selectedShot.id]: value,
                        }))
                      : setPromptDrafts((drafts) => ({
                          ...drafts,
                          [selectedShot.id]: value,
                        }))
                  }
                  onReferenceUpload={handleStoryboardReferenceUpload}
                  onReferenceRemove={handleStoryboardReferenceRemove}
                  onGenerate={
                    generationMode === "storyboard"
                      ? handleGenerateStoryboardImage
                      : undefined
                  }
                  onImageModelChange={setSelectedImageModelId}
                  onImageRatioChange={setSelectedImageRatio}
                  onImageCountChange={setSelectedImageCount}
                  onModelChange={setSelectedModel}
                  onChannelChange={setSelectedChannel}
                  onDurationChange={setSelectedDuration}
                  onResolutionChange={setSelectedResolution}
                  onRatioChange={setSelectedRatio}
                  onSoundChange={setSelectedSound}
                />

                {generationMode === "storyboard" ? (
                  <ImageGenerationHistory
                    historyItems={imageHistoryItems}
                    isLoading={imageHistoryLoading}
                    shot={selectedDisplayShot ?? selectedShot}
                    onToggleFinal={handleToggleFinalImage}
                    updatingFinalId={updatingFinalImageId}
                  />
                ) : (
                  <GenerationHistory
                    historyItems={videoHistoryItems}
                    isLoading={videoHistoryLoading}
                    shot={selectedShot}
                    onToggleFinal={handleToggleFinalVideo}
                    updatingFinalId={updatingFinalId}
                    onPreview={(item) => {
                      setPreviewShotId(selectedShot.id);
                      setPreviewItem(item);
                      setPreviewOpen(true);
                    }}
                  />
                )}
              </div>
            )}

            <ShotStrip
              shots={thumbnailShots}
              selectedShotId={selectedShot?.id ?? null}
              onSelectShot={setSelectedShotId}
              onBatchGenerateVideos={(shotIds) => {
                sonnerToast.info(`已选择 ${shotIds.length} 个镜头`, {
                  description: "批量生成视频功能待接入",
                });
              }}
              onBatchDownloadVideos={(shotIds) => {
                sonnerToast.info(`已选择 ${shotIds.length} 个镜头`, {
                  description: "批量下载功能待接入",
                });
              }}
              onScheduleSubmitVideos={(shotIds) => {
                sonnerToast.info(`已选择 ${shotIds.length} 个镜头`, {
                  description: "定时提交功能待接入",
                });
              }}
            />

            <VideoPreviewDialog
              item={previewItem}
              shot={selectedShot}
              shots={thumbnailShots}
              historyItems={videoHistoryItems}
              open={previewOpen}
              onOpenChange={(open) => {
                setPreviewOpen(open);
                if (!open) {
                  setPreviewItem(null);
                  setPreviewShotId(null);
                }
              }}
              onSelectShot={(shotId) => {
                setPreviewShotId(shotId);
                setSelectedShotId(shotId);
                setPreviewItem(null);
              }}
              previewShotId={previewShotId}
              onSelectVersion={setPreviewItem}
              onToggleFinal={handleToggleFinalVideo}
              updatingFinalId={updatingFinalId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
