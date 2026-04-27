import { get, post } from "./client";

export function fetchChapterScripts(chapterId: string) {
  return get<unknown>(`/novel-show/chapter/${chapterId}/scripts`);
}

export function generateImagePromptQueued(chapterId: string) {
  return post<unknown>(`/novel-show/chapter/${chapterId}/generate-image-prompt-queued`);
}

export function getImagePromptStatus(chapterId: string) {
  return get<unknown>(`/novel-show/chapter/${chapterId}/generate-image-prompt-status`);
}

export function generateVideoPromptQueued(chapterId: string) {
  return post<unknown>(`/novel-show/chapter/${chapterId}/generate-video-prompt-queued`);
}

export function getVideoPromptStatus(chapterId: string) {
  return get<unknown>(`/novel-show/chapter/${chapterId}/generate-video-prompt-status`);
}

export function startEpisodeWorkflow(chapterId: string) {
  return post<unknown>(`/novel-show/chapter/${chapterId}/seedance-episode-workflow/start`);
}

export function getEpisodeWorkflowStatus(chapterId: string) {
  return get<unknown>(`/novel-show/chapter/${chapterId}/seedance-episode-workflow/status`);
}

export function cancelEpisodeWorkflow(chapterId: string) {
  return post<unknown>(`/novel-show/chapter/${chapterId}/seedance-episode-workflow/cancel`);
}
