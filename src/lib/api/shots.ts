import { get, post } from "./client";

export function fetchShots(episodeId: string) {
  return get<unknown[]>(`/novel-show/chapter/${episodeId}/scripts`);
}

export function generateStoryboard(episodeId: string, data: Record<string, unknown>) {
  return post<unknown>(`/novel-show/chapter/${episodeId}/generate-storyboard`, data);
}
