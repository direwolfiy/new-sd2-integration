import { get, post, put, del } from "./client";
import type { PageResult, SceneRoleItem, TemplateItem, TemplateQuery } from "./types";

export function fetchElements(contentId: string) {
  return get<SceneRoleItem[]>(`/resource/scene-role/content/${contentId}`);
}

export function fetchElement(templateId: string) {
  return get<TemplateItem>(`/resource/template/${templateId}`);
}

export function createElement(data: Partial<TemplateItem> & { templateName: string; templateType: number }) {
  return post<TemplateItem>("/resource/template", data);
}

export function updateElement(templateId: string, data: Partial<TemplateItem>) {
  return put<TemplateItem>(`/resource/template/${templateId}`, data);
}

export function deleteElement(templateId: string) {
  return del<boolean>(`/resource/template/${templateId}`);
}

export function batchDeleteElements(templateIds: string[]) {
  return post<{ deletedCount: number }>("/resource/template/batch-delete", { templateIds });
}

// Project-level character CRUD (Seedance)

export interface CreateCharacterParams {
  templateName: string;
  contentId: string;
  description?: string;
  coverImage?: string;
}

export function createCharacter(projectId: string, data: CreateCharacterParams) {
  return post<TemplateItem>(`/novel-show/project/${projectId}/role`, {
    template_name: data.templateName,
    content_id: data.contentId,
    description: data.description,
    cover_image: data.coverImage,
  });
}

export interface UpdateCharacterParams {
  templateId: string;
  templateName?: string;
  description?: string;
  coverImage?: string;
  timbreDescription?: string;
  appearance?: Record<string, unknown>;
  tags?: string[];
}

export function updateCharacter(data: UpdateCharacterParams) {
  const { templateId, tags, ...rest } = data;
  const body: Record<string, unknown> = {
    template_id: templateId,
    ...rest,
  };
  if (tags) body.tags = tags;
  return put<TemplateItem>(`/novel-show/project/role/${templateId}`, body);
}

export function deleteSceneRole(roleId: string) {
  return del<boolean>(`/resource/scene-role/${roleId}`);
}
