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
  dialogue?: string | string[] | Record<string, unknown>[] | null;
  sourceText?: string | null;
  speechContent?: string | null;
  rawDescription?: string | null;
  estimatedDuration?: number | null;
  videoPrompt?: string | null;
  hasVideoResult?: boolean | null;
  videoCount?: number | null;
  videoUrl?: string | null;
  videoResultUrl?: string | null;
  resultVideoUrl?: string | null;
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
