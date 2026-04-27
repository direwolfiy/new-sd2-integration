import { get, post } from "./client";

export function createImageTask(data: Record<string, unknown>) {
  return post<unknown>("/image-generation/edit-image", data);
}

export function fetchImageTask(taskId: string) {
  return get<unknown>(`/image-generation/tasks/${taskId}`);
}

export function fetchImageHistory(data: Record<string, unknown>) {
  return post<unknown>("/image-generation/history", data);
}
