import type { ContentItem, ChapterItem, TemplateItem } from "@/lib/api/types";
import type { Project, Episode, ElementItem, ElementType } from "@/mocks/types";

const PRODUCTION_STAGE_MAP: Record<number, string> = {
  1: "进行中",
  2: "审核中",
  3: "已完成",
};

const TEMPLATE_TYPE_MAP: Record<string, ElementType> = {
  ROLE: "character",
  SCENE: "scene",
  PROP: "prop",
  AUDIO: "audio",
};

export function adaptProject(c: ContentItem): Project {
  const stage = c.productionStage ?? 1;
  const status = PRODUCTION_STAGE_MAP[stage] ?? "进行中";
  const progress = stage === 3 ? 100 : stage === 2 ? 90 : Math.min(100, (c.chapterCount ?? 0) * 10);

  return {
    id: String(c.id),
    name: c.title,
    coverUrl: c.coverUrl ?? "",
    status: status as Project["status"],
    progress,
    completedEpisodes: 0,
    totalEpisodes: c.chapterCount ?? 0,
    lastEditedAt: c.updatedTime ? formatRelativeTime(c.updatedTime) : "",
    lastEditedBy: c.producerName ?? "",
    createdAt: c.createdTime?.slice(0, 10) ?? "",
    genre: c.style ?? "",
    creativeType: c.videoCreateBusinessType ?? "2D 动漫",
    description: c.summary ?? "",
  };
}

export function adaptChapter(ch: ChapterItem, projectId: string): Episode {
  const hasScript = !!ch.chapterContent;
  const hasVideo = !!ch.videoUrl;
  return {
    id: String(ch.id),
    projectId: String(ch.contentId),
    episodeNumber: ch.chapterOrder,
    title: ch.chapterTitle ?? `第 ${ch.chapterOrder} 集`,
    stages: {
      script: hasScript,
      storyboard: hasScript,
      video: hasVideo,
      export: hasVideo && !!ch.subtitlesResultUrl,
    },
    duration: ch.videoDuration ? formatDuration(ch.videoDuration) : "—",
    lastEditedAt: ch.updatedTime ? formatRelativeTime(ch.updatedTime) : "",
  };
}

export function adaptElement(t: TemplateItem): ElementItem {
  const type = TEMPLATE_TYPE_MAP[t.template_type] ?? "prop";
  const tags: string[] = [];
  if (t.role_type) tags.push(t.role_type);
  if (t.template_category) tags.push(t.template_category);

  return {
    id: String(t.id),
    projectId: String(t.contentId),
    type,
    name: t.template_name,
    thumbnailUrl: t.cover_image ?? t.primaryImageUrl ?? "",
    tags,
    createdAt: t.created_time?.slice(0, 10) ?? "",
  };
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} 天前`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek} 周前`;
  return dateStr.slice(0, 10);
}
