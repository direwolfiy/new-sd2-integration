import { get, post, put, del } from "./client";

export function fetchElements(projectId: string) {
  return get<unknown[]>(`/resource/scene-content/list`, { projectId });
}

export function fetchElement(elementId: string) {
  return get<unknown>(`/resource/element/${elementId}`);
}

export function batchOperations(data: Record<string, unknown>) {
  return post<unknown>("/resource/element/batch-operations", data);
}

export function deleteElement(elementId: string) {
  return del<boolean>(`/resource/element/${elementId}`);
}
