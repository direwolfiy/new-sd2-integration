import { get, post } from "./client";

export function createVideoTask(data: Record<string, unknown>) {
  return post<unknown>("/video/generation/unified/submit", data);
}

export function fetchVideoTaskStatus(taskId: string) {
  return get<unknown>(`/video/generation/tasks/${taskId}`);
}

export function fetchVideoHistory(data: Record<string, unknown>) {
  return post<unknown>("/video/generation/history", data);
}
