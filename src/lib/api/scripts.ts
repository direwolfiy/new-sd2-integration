import { get, post } from "./client";

export function fetchScript(projectId: string) {
  return get<unknown>(`/resource/script/${projectId}`);
}

export function importScript(data: Record<string, unknown>) {
  return post<unknown>("/resource/script/import", data);
}

export function analyzeScript(scriptId: string) {
  return post<unknown>(`/resource/script/${scriptId}/analyze`);
}
