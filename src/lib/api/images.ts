import { get, post } from "./client";
import type { ImageGenerationHistoryQuery, ImageGenerationHistoryItem, PageResult } from "./types";

export interface CreateImageTaskParams {
  prompt: string;
  modelBusinessType: number;
  aspectRatio?: string;
  imageCount?: number;
  referenceImages?: string[];
  projectId?: string;
  businessId?: string;
  businessType?: string;
  generationType?: string;
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
  });
}

export interface ImageTaskStatus {
  taskId: number;
  taskStatus: string;
  imageUrls?: string[] | null;
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
