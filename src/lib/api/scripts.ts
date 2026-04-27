import { get, post } from "./client";

export function fetchScript(chapterId: string) {
  return get<unknown>(`/resource/scene-script/chapter/${chapterId}`);
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
