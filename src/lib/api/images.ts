import { get, post, upload } from "./client";
import type {
  ImageGenerationHistoryQuery,
  ImageGenerationHistoryItem,
  PageResult,
  ResourceTemplateAssetHistoryItem,
} from "./types";

export interface CreateImageTaskParams {
  prompt: string;
  modelBusinessType: number;
  modelId?: string;
  aspectRatio?: string;
  imageCount?: number;
  referenceImages?: string[];
  projectId?: string;
  businessId?: string;
  businessType?: string;
  generationType?: string;
  responseFormat?: string;
  extraParams?: Record<string, unknown>;
}

export function createImageTask(data: CreateImageTaskParams) {
  return post<number>("/image-generation/edit-image", {
    prompt: data.prompt,
    modelBusinessType: data.modelBusinessType,
    aspectRatio: data.aspectRatio,
    imageCount: data.imageCount,
    referenceImages: data.referenceImages,
    projectId: data.projectId,
    contentId: data.projectId,
    businessId: data.businessId,
    businessType: data.businessType,
    generationType: data.generationType,
    responseFormat: data.responseFormat,
    extraParams: data.extraParams,
    modelId: data.modelId,
  });
}

export interface ImageTaskStatus {
  taskId: number;
  taskStatus: string;
  task_status?: string | null;
  imageUrls?: string[] | null;
  image_urls?: string[] | null;
  imageUrl?: string | null;
  image_url?: string | null;
  prompt?: string | null;
  modelId?: string | null;
  aspectRatio?: string | null;
  imageCount?: number | null;
  errorMessage?: string | null;
  createdTime?: string | null;
  updatedTime?: string | null;
}

export function fetchImageTaskStatus(taskId: string) {
  return get<ImageTaskStatus>(`/image-generation/tasks/${taskId}`);
}

export function fetchImageHistory(data: ImageGenerationHistoryQuery) {
  return post<PageResult<ImageGenerationHistoryItem>>("/image/generation/history", data);
}

export function fetchLatestImages() {
  return get<unknown[]>("/asset/resource/latest");
}

export function uploadImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return upload<string[]>("/files/images/upload", formData);
}

export interface ResourceTemplateAssetHistoryQuery {
  resourceTempId: string | number;
  assetType?: string;
  resourceTypes?: string[];
  usageTypes?: string[];
  pageNum?: number;
  pageSize?: number;
}

export function fetchTemplateAssetHistory(params: ResourceTemplateAssetHistoryQuery) {
  return get<PageResult<ResourceTemplateAssetHistoryItem>>(
    "/resource/template-asset-history",
    {
      resourceTempId: String(params.resourceTempId),
      assetType: params.assetType ?? "image",
      ...(params.resourceTypes?.length ? { resourceTypes: params.resourceTypes.join(",") } : {}),
      ...(params.usageTypes?.length ? { usageTypes: params.usageTypes.join(",") } : {}),
      pageNum: String(params.pageNum ?? 1),
      pageSize: String(params.pageSize ?? 50),
    },
  );
}

export interface CreateTemplateAssetHistoryParams {
  contentId?: string | number;
  resourceTempId: string | number;
  assetType?: string;
  resourceType: string;
  sourceType: string;
  sourceRefType?: string;
  sourceRefId?: string | number;
  title?: string;
  assetUrl: string;
  thumbnailUrl?: string;
  usageType?: string;
  metadata?: Record<string, unknown>;
}

export function createTemplateAssetHistory(data: CreateTemplateAssetHistoryParams) {
  return post<ResourceTemplateAssetHistoryItem>("/resource/template-asset-history", data);
}
