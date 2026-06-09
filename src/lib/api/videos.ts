import { get, post, put } from "./client";
import type { PageResult, SceneScriptItem } from "./types";

export interface VideoGenerationHistoryQuery {
  pageNum?: number;
  pageSize?: number;
  shotId?: string;
  businessId?: string;
  businessType?: string;
  taskStatus?: string;
  modelId?: string;
  prompt?: string;
}

export interface VideoGenerationHistoryItem {
  taskId?: string | number | null;
  id?: string | number | null;
  createdTime?: string | null;
  updateTime?: string | null;
  status?: string | null;
  taskStatus?: string | null;
  title?: string | null;
  modelId?: string | null;
  duration?: number | null;
  videoUrl?: string | null;
  video_url?: string | null;
  videoUrls?: string[] | null;
  video_urls?: string[] | null;
  videoResultUrl?: string | null;
  video_result_url?: string | null;
  resultVideoUrl?: string | null;
  result_video_url?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  lastFrameUrl?: string | null;
  last_frame_url?: string | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  prompt?: string | null;
  videoPrompt?: string | null;
  video_prompt?: string | null;
  progress?: number | null;
  aspectRatio?: string | null;
  aspect_ratio?: string | null;
}

export function createVideoTask(data: Record<string, unknown>) {
  return post<unknown>("/video/generation/unified/submit", data);
}

export function fetchVideoTaskStatus(taskId: string) {
  return get<unknown>(`/video/generation/tasks/${taskId}`);
}

export function fetchVideoHistory(data: VideoGenerationHistoryQuery) {
  return post<
    PageResult<VideoGenerationHistoryItem> | VideoGenerationHistoryItem[]
  >("/video/generation/history", data);
}

export function updateScriptVideoResultUrl(
  scriptId: string,
  data: {
    videoResultUrl: string | null;
    audioSourceType?: "narration" | "embedded_video";
  },
) {
  return put<SceneScriptItem>(
    `/resource/scene-script/${scriptId}/video-result-url`,
    data,
  );
}
