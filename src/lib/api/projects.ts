import { get, post, put } from "./client";

// TODO: align types with backend response shape once endpoints confirmed
export interface ProjectResponse {
  id: string;
  name: string;
  status: string;
  // extend as needed
}

export function fetchProjects() {
  return post<ProjectResponse[]>("/novel-show/project/list", {});
}

export function fetchProject(id: string) {
  return get<ProjectResponse>(`/novel-show/project/${id}`);
}

export function createProject(data: Record<string, unknown>) {
  return post<ProjectResponse>("/novel-show/project", data);
}

export function updateProject(id: string, data: Record<string, unknown>) {
  return put<boolean>(`/novel-show/project/${id}`, data);
}
