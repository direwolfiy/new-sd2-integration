import type {
  ContentItem,
  ChapterItem,
  SceneRoleItem,
  SceneScriptItem,
} from "@/lib/api/types";
import type { SeedanceAssetListItem } from "@/lib/api/shots";
import type {
  Project,
  Episode,
  ElementItem,
  ElementType,
  Shot,
  VideoVersion,
  ScriptMetadata,
  ScriptEpisode,
} from "@/mocks/types";

const PRODUCTION_STAGE_MAP: Record<number, string> = {
  1: "进行中",
  2: "审核中",
  3: "已完成",
};

const TEMPLATE_TYPE_MAP: Record<string, ElementType> = {
  ROLE: "character",
  CHARACTER: "character",
  SCENE: "scene",
  PROP: "prop",
  PROPS: "prop",
  MATERIAL: "material",
  IMAGE: "material",
  VIDEO: "material",
  FILE: "material",
  AUDIO: "audio",
};

export function getChapterContent(ch: ChapterItem | null | undefined): string {
  return ch?.chapterContent ?? ch?.chapter_content ?? "";
}

export function adaptProject(c: ContentItem): Project {
  const stage = c.productionStage ?? 1;
  const status = PRODUCTION_STAGE_MAP[stage] ?? "进行中";
  const progress =
    stage === 3
      ? 100
      : stage === 2
        ? 90
        : Math.min(100, (c.chapterCount ?? 0) * 10);

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
  const hasScript = !!getChapterContent(ch).trim();
  const hasVideo = !!ch.videoUrl;
  return {
    id: String(ch.id),
    projectId: String(ch.contentId ?? projectId),
    episodeNumber: ch.chapterOrder,
    title: ch.chapterTitle ?? `第 ${ch.chapterOrder} 集`,
    stages: {
      script: hasScript,
      storyboard: hasScript,
      video: hasVideo,
      editor: hasVideo && !!ch.subtitlesResultUrl,
    },
    duration: ch.videoDuration ? formatDuration(ch.videoDuration) : "—",
    lastEditedAt: ch.updatedTime ? formatRelativeTime(ch.updatedTime) : "",
  };
}

export function adaptElements(roles: SceneRoleItem[]): ElementItem[] {
  const seen = new Set<string>();
  const items: ElementItem[] = [];

  for (const r of roles) {
    const type = TEMPLATE_TYPE_MAP[(r.template_type ?? "").toUpperCase()] ?? "prop";
    const isCharacter = type === "character";
    const charName = isCharacter
      ? extractBeforeDash(r.template_name ?? "")
      : null;
    const key = isCharacter ? charName! : String(r.id);

    if (seen.has(key)) continue;
    seen.add(key);

    const meta = r.template_metadata as Record<string, unknown> | null;
    const metaTags = meta?.tags as string[] | undefined;
    const tags =
      metaTags ??
      ([r.role_type, r.template_category].filter(Boolean) as string[]);

    items.push({
      id: String(r.id),
      bindingId: String(r.id),
      templateId: r.resource_temp_id ? String(r.resource_temp_id) : undefined,
      projectId: String(r.content_id ?? ""),
      type,
      name: isCharacter ? charName! : (r.template_name ?? ""),
      thumbnailUrl: r.cover_image ?? "",
      tags,
      createdAt: "",
    });
  }
  return items;
}

export function adaptSeedanceAssets(
  assets: SeedanceAssetListItem[],
): ElementItem[] {
  const seen = new Set<string>();
  const items: ElementItem[] = [];

  for (const asset of assets) {
    const templateType = asset.templateType ?? asset.template_type ?? "";
    const templateName = asset.templateName ?? asset.template_name ?? "";
    const type = TEMPLATE_TYPE_MAP[templateType.toUpperCase()] ?? "material";
    const name =
      type === "character"
        ? extractBeforeDash(templateName)
        : templateName;
    const stableId = String(
      asset.resourceTempId ?? asset.resource_temp_id ?? asset.id ?? name,
    );
    const bindingId = asset.id != null ? String(asset.id) : undefined;
    const key = `${type}:${stableId || name}`;

    if (seen.has(key)) continue;
    seen.add(key);

    const meta = (asset.templateMetadata ?? asset.template_metadata) as Record<
      string,
      unknown
    > | null;
    const metaTags = meta?.tags as string[] | undefined;
    const tags =
      metaTags ??
      ([
        asset.roleType ?? asset.role_type,
        asset.templateCategory ?? asset.template_category,
      ].filter(Boolean) as string[]);

    items.push({
      id: stableId,
      bindingId,
      templateId: stableId,
      projectId: String(asset.contentId ?? asset.content_id ?? ""),
      type,
      name,
      thumbnailUrl: asset.coverImage ?? asset.cover_image ?? "",
      tags,
      createdAt: "",
    });
  }

  return items;
}

function extractBeforeDash(name: string): string {
  const idx = name.indexOf("-");
  return idx > 0 ? name.slice(0, idx) : name;
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

export function adaptShot(item: SceneScriptItem, episodeId: string): Shot {
  const status = normalizeVideoStatus(item.videoStatus);
  return {
    id: String(item.id),
    episodeId,
    number: item.sortOrder,
    description: item.scriptContent ?? "",
    prompt: item.imagePrompt ?? item.videoPrompt ?? "",
    hasImage: !!item.imageUrl,
    hasVideo: !!item.videoUrl,
    videoStatus: status,
    videoVersions: 0,
    duration: item.duration != null ? `${item.duration}s` : "—",
    elements: [],
  };
}

export function adaptVideoVersions(
  data: unknown,
  shotId: string,
): VideoVersion[] {
  if (!Array.isArray(data)) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any, i: number) => ({
    id: item.id ?? `v-${shotId}-${i}`,
    shotId,
    version: item.version ?? i + 1,
    status: normalizeVideoStatus(item.status),
    duration: item.duration != null ? `${item.duration}s` : "—",
    createdAt: item.createdAt ?? item.created_time ?? "",
    prompt: item.prompt ?? item.videoPrompt ?? "",
  }));
}

function normalizeVideoStatus(
  status: string | null | undefined,
): Shot["videoStatus"] {
  if (status === "generating") return "generating";
  if (status === "completed") return "completed";
  return "pending";
}

export function adaptScriptMetadata(
  content: ContentItem,
  chapters: ChapterItem[],
): ScriptMetadata {
  const rawScript = content.script ?? "";
  return {
    genre: content.style ?? "",
    summary: content.summary ?? "",
    totalWordCount: rawScript.length,
    episodeCount: chapters.length,
    tags: [],
  };
}

export function adaptScriptEpisode(ch: ChapterItem): ScriptEpisode {
  const content = getChapterContent(ch);
  return {
    id: String(ch.id),
    episodeNumber: ch.chapterOrder,
    title: ch.chapterTitle ?? `第 ${ch.chapterOrder} 集`,
    summary: content.slice(0, 100),
    content,
    wordCount: content.length,
    characters: [],
  };
}
