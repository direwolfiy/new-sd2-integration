import { get, post } from "./client";

export function fetchAssets(data?: Record<string, unknown>) {
  return post<unknown[]>("/asset/list", data ?? {});
}

export function uploadAsset(data: FormData) {
  return post<unknown>("/asset/upload", data);
}
