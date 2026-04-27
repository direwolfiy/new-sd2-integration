import { get } from "./client";
import type { ChapterItem } from "./types";

export function fetchChapters(contentId: string, includeStats = false) {
  return get<ChapterItem[]>("/resource/scene-chapter/list", {
    contentId,
    includeStats: String(includeStats),
  });
}

export function fetchChapter(chapterId: string) {
  return get<ChapterItem>(`/resource/scene-chapter/${chapterId}`);
}

export function fetchChapterScripts(chapterId: string) {
  return get<unknown>(`/novel-show/chapter/${chapterId}/scripts`);
}
