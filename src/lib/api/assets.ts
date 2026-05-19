import { post } from "./client";
import type { AssetResourceItem, PageResult } from "./types";

export function fetchAssets(data?: Record<string, unknown>) {
  return post<PageResult<AssetResourceItem>>("/asset/resource/list", data ?? { page_num: 1, page_size: 50 });
}

export function fetchLatestAssets() {
  return post<unknown[]>("/asset/resource/latest", {});
}

export function fetchLibraryContent(libraryId: string) {
  return post<unknown>("/asset/library/content", { libraryId });
}
