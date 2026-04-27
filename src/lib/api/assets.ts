import { post } from "./client";
import type { AssetResourceItem, PageResult } from "./types";

export function fetchAssets(data?: Record<string, unknown>) {
  return post<PageResult<AssetResourceItem>>("/asset/resource/list", data ?? { pageNum: 1, pageSize: 50 });
}

export function fetchLatestAssets() {
  return post<unknown[]>("/asset/resource/latest", {});
}

export function fetchLibraryContent(libraryId: string) {
  return post<unknown>("/asset/library/content", { libraryId });
}
