import { del, get, post, put } from "./client";
import type { PageResult, SceneScriptItem } from "./types";

export type SeedanceWorkflowStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";
export type SeedanceWorkflowNode =
  | "split"
  | "judgeSplit"
  | "splitPriority"
  | "critiqueSplit"
  | "refineSplit"
  | "batchVideo"
  | "batchReferenceSelection"
  | "discriminate"
  | "refine";

export interface GenerationMeta {
  taskId?: string | number | null;
  model?: string | null;
  promptVersion?: string | number | null;
  generatedAt?: string | null;
}

export interface SeedanceScriptItem {
  id?: string | number;
  sequence?: number;
  order_sort?: number | null;
  dialogue?: string | string[] | Record<string, unknown>[] | null;
  sourceText?: string | null;
  source_text?: string | null;
  speechContent?: string | null;
  speech_content?: string | null;
  rawDescription?: string | null;
  raw_description?: string | null;
  body?: string | null;
  title?: string | null;
  estimatedDuration?: number | null;
  estimated_duration?: number | null;
  duration_seconds?: number | null;
  videoPrompt?: string | null;
  video_prompt?: string | null;
  hasVideoResult?: boolean | null;
  has_video_result?: boolean | null;
  videoCount?: number | null;
  video_count?: number | null;
  imageUrl?: string | null;
  image_url?: string | null;
  imageResultUrl?: string | null;
  image_result_url?: string | null;
  resultImageUrl?: string | null;
  result_image_url?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  lastFrameUrl?: string | null;
  last_frame_url?: string | null;
  videoUrl?: string | null;
  video_url?: string | null;
  videoResultUrl?: string | null;
  video_result_url?: string | null;
  resultVideoUrl?: string | null;
  result_video_url?: string | null;
}

export interface SeedanceAssetListItem {
  id?: string | number;
  contentId?: string | number | null;
  content_id?: string | number | null;
  resourceTempId?: string | number | null;
  resource_temp_id?: string | number | null;
  status?: number | null;
  type?: number | null;
  chapterId?: string | number | null;
  chapter_id?: string | number | null;
  remark?: string | null;
  templateName?: string | null;
  template_name?: string | null;
  roleType?: string | null;
  role_type?: string | null;
  templateCategory?: string | null;
  template_category?: string | null;
  templateType?: string | null;
  template_type?: string | null;
  description?: string | null;
  coverImage?: string | null;
  cover_image?: string | null;
  appearance?: Record<string, unknown> | null;
  templateMetadata?: Record<string, unknown> | null;
  template_metadata?: Record<string, unknown> | null;
  isReferencedFromProject?: boolean | null;
  is_referenced_from_project?: boolean | null;
  seedanceAssetUuid?: string | null;
  seedance_asset_uuid?: string | null;
  seedanceAssetStatus?: string | null;
  seedance_asset_status?: string | null;
}

export interface SeedanceScriptListResponse {
  scripts: SeedanceScriptItem[];
  storySummary?: string | null;
  roleList?: Array<Record<string, unknown>> | null;
  generationMeta?: GenerationMeta | null;
  storyType?: string | null;
}

export interface SeedanceScriptPayload {
  scriptId?: string | number;
  chapterId?: string | number;
  insertAfterScriptId?: string | number | null;
  sequence?: number;
  dialogue?: string | string[] | Record<string, unknown>[] | null;
  rawDescription?: string | null;
  estimatedDuration?: number | null;
  videoPrompt?: string | null;
}

export interface SeedanceWorkflowDetail {
  runId: string;
  episodeId: number;
  status: SeedanceWorkflowStatus;
  currentNode: SeedanceWorkflowNode | null;
  nodeStatuses: Partial<
    Record<SeedanceWorkflowNode, SeedanceWorkflowStatus | null>
  >;
  errorMessage: string | null;
  finishedAt: string | null;
  updatedAt: string | null;
}

export function fetchChapterScripts(chapterId: string) {
  return get<SceneScriptItem[] | PageResult<SceneScriptItem>>(
    `/novel-show/chapter/${chapterId}/scripts`,
  );
}

export function fetchSeedanceScripts(chapterId: string, forceRefresh = false) {
  return get<SeedanceScriptListResponse>(
    `/seedance/chapter/${chapterId}/scripts`,
    forceRefresh ? { _t: String(Date.now()) } : undefined,
  );
}

export function fetchSeedanceAssets(chapterId: string, contentId?: string) {
  return get<SeedanceAssetListItem[]>(
    `/seedance/chapter/${chapterId}/assets`,
    contentId ? { contentId } : undefined,
  );
}

export function createSeedanceScript(
  data: SeedanceScriptPayload & { chapterId: string },
) {
  return post<SeedanceScriptItem>("/seedance/script", data);
}

export function updateSeedanceScript(
  scriptId: string,
  data: SeedanceScriptPayload,
) {
  return put<SeedanceScriptPayload>(`/seedance/script/${scriptId}`, data);
}

export function deleteSeedanceScript(scriptId: string) {
  return del<boolean>(`/seedance/script/${scriptId}`);
}

export function batchDeleteSeedanceScripts(scriptIds: string[]) {
  return post<{
    total: number;
    success: number;
    failed: number;
    failed_ids: number[];
  }>("/seedance/script/batch-delete", { scriptIds });
}

export function updateSeedanceScriptOrder(
  items: Array<{ scriptId: string; orderSort: number }>,
) {
  return put<{ updated: number }>("/seedance/script/order-sort/batch", {
    items,
  });
}

export function generateImagePromptQueued(chapterId: string) {
  return post<unknown>(
    `/novel-show/chapter/${chapterId}/generate-image-prompt-queued`,
  );
}

export function getImagePromptStatus(chapterId: string) {
  return get<unknown>(
    `/novel-show/chapter/${chapterId}/generate-image-prompt-status`,
  );
}

export function generateVideoPromptQueued(chapterId: string) {
  return post<unknown>(
    `/novel-show/chapter/${chapterId}/generate-video-prompt-queued`,
  );
}

export function getVideoPromptStatus(chapterId: string) {
  return get<unknown>(
    `/novel-show/chapter/${chapterId}/generate-video-prompt-status`,
  );
}

export function startEpisodeWorkflow(
  chapterId: string,
  data?: {
    retryMode?: "fresh" | "resume";
    resumeRunId?: string;
    resumeFromNode?: SeedanceWorkflowNode;
  },
) {
  return post<SeedanceWorkflowDetail>(
    `/novel-show/chapter/${chapterId}/seedance-episode-workflow/start`,
    data ?? {},
  );
}

export function getEpisodeWorkflowStatus(chapterId: string, runId?: string) {
  return get<SeedanceWorkflowDetail>(
    `/novel-show/chapter/${chapterId}/seedance-episode-workflow/status`,
    runId ? { run_id: runId } : undefined,
  );
}

export function cancelEpisodeWorkflow(chapterId: string, runId?: string) {
  return post<SeedanceWorkflowDetail>(
    `/novel-show/chapter/${chapterId}/seedance-episode-workflow/cancel`,
    runId ? { runId } : undefined,
  );
}
