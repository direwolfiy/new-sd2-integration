import { get, post, put } from "./client";
import type { ContentItem, ChapterItem, SceneScriptPromptItem } from "./types";
import { fetchProject } from "./projects";
import { fetchChapters } from "./episodes";

export interface ProjectScriptData {
  content: ContentItem;
  chapters: ChapterItem[];
}

export async function fetchProjectScript(projectId: string): Promise<ProjectScriptData> {
  const [content, chapters] = await Promise.all([
    fetchProject(projectId),
    fetchChapters(projectId),
  ]);
  return { content, chapters };
}

export function fetchScript(chapterId: string) {
  return get<unknown>(`/resource/scene-script/chapter/${chapterId}`);
}

export function fetchSceneScriptPrompts(chapterId: string) {
  return get<SceneScriptPromptItem[]>(
    "/resource/scene-script-prompt/list",
    { chapterId },
  );
}

export function updateSceneScriptPromptFirstImage(
  promptId: string,
  videoFirstImg: string | null,
) {
  return put<SceneScriptPromptItem>(
    `/resource/scene-script-prompt/${promptId}/video-first-img`,
    { videoFirstImg },
  );
}

export function importScript(data: { contentId: string; rawContent: string }) {
  return post<unknown>("/resource/scene-content", data);
}

export function fetchStyles() {
  return get<unknown[]>("/novel-show/project/styles");
}

export function fetchStyleByName(styleName: string) {
  return get<unknown>("/novel-show/project/styles/by-name", { styleName });
}
