import { get, post } from "./client";
import type { PageResult, ContentItem, ContentQuery } from "./types";

export function fetchProjects(query?: ContentQuery) {
  return post<PageResult<ContentItem>>("/resource/scene-content/list", {
    pageNum: 1,
    pageSize: 50,
    businessType: 5,
    ...query,
  });
}

export function fetchProject(id: string) {
  return get<ContentItem>(`/resource/scene-content/${id}`);
}

export function createProject(data: Partial<ContentItem> & { title: string }) {
  return post<ContentItem>("/resource/scene-content", data);
}

export function updateProject(id: string, data: Partial<ContentItem>) {
  return post<ContentItem>(`/resource/scene-content/${id}`, data);
}
