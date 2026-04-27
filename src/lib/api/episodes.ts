import { get, post } from "./client";

export function fetchEpisodes(projectId: string) {
  return post<unknown[]>("/novel-show/chapter/list", { projectId });
}

export function fetchEpisode(episodeId: string) {
  return get<unknown>(`/novel-show/chapter/${episodeId}`);
}

export function createEpisode(projectId: string, data: Record<string, unknown>) {
  return post<unknown>("/novel-show/chapter", { projectId, ...data });
}
