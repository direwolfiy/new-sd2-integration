import { get, post, put, del } from "./client";
import type { PageResult, TemplateItem, TemplateQuery } from "./types";

export function fetchElements(query?: TemplateQuery) {
  return post<PageResult<TemplateItem>>("/resource/template/list", {
    pageNum: 1,
    pageSize: 200,
    ...query,
  });
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
