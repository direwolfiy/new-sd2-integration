import { shotsApi, videosApi } from "@/lib/api";
import type { SeedanceScriptItem } from "@/lib/api/shots";
import type { SceneScriptItem } from "@/lib/api/types";
import type { VideoGenerationHistoryItem } from "@/lib/api/videos";
import type { ShotPreviewMap, VideoHistoryItem, VideoShot } from "./types";

export function firstPresentString(
  ...values: Array<string | number | null | undefined>
) {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}

export function normalizeVideoShot(
  item: SeedanceScriptItem,
  index: number,
): VideoShot {
  const videoUrl = firstPresentString(
    item.videoUrl,
    item.video_url,
    item.videoResultUrl,
    item.video_result_url,
    item.resultVideoUrl,
    item.result_video_url,
  );
  const posterUrl = firstPresentString(
    item.thumbnailUrl,
    item.thumbnail_url,
    item.coverUrl,
    item.cover_url,
    item.lastFrameUrl,
    item.last_frame_url,
    item.imageUrl,
    item.image_url,
    item.imageResultUrl,
    item.image_result_url,
    item.resultImageUrl,
    item.result_image_url,
  );
  const bodyText =
    typeof item.body === "string" ? parseShotBodyContent(item.body) : null;
  return {
    id: String(item.id ?? index + 1),
    number: Number(item.sequence ?? item.order_sort ?? index + 1),
    description:
      firstPresentString(
        item.rawDescription,
        item.raw_description,
        item.speechContent,
        item.speech_content,
        item.sourceText,
        item.source_text,
        bodyText,
        item.title,
        typeof item.dialogue === "string" ? item.dialogue : null,
      ) ?? "",
    prompt: firstPresentString(item.videoPrompt, item.video_prompt) ?? "",
    duration:
      item.estimatedDuration ??
      item.estimated_duration ??
      item.duration_seconds ??
      null,
    hasVideo: Boolean(item.hasVideoResult ?? item.has_video_result ?? videoUrl),
    videoCount: Number(
      item.videoCount ??
        item.video_count ??
        (item.hasVideoResult || item.has_video_result ? 1 : 0),
    ),
    posterUrl,
    videoUrl,
    finalVideoUrl: null,
  };
}

function parseShotBodyContent(body: string) {
  try {
    const parsed = JSON.parse(body) as {
      content?: unknown;
      rawDescription?: unknown;
      raw_description?: unknown;
    };
    return firstPresentString(
      typeof parsed.content === "string" ? parsed.content : null,
      typeof parsed.rawDescription === "string" ? parsed.rawDescription : null,
      typeof parsed.raw_description === "string" ? parsed.raw_description : null,
    );
  } catch {
    return body;
  }
}

function normalizeVideoStatus(
  status?: string | null,
  taskStatus?: string | null,
): VideoHistoryItem["status"] {
  const value = String(taskStatus ?? status ?? "").toUpperCase();
  if (value === "COMPLETED" || value === "SUCCEEDED" || value === "SUCCESS") {
    return "completed";
  }
  if (value === "RUNNING" || value === "PROCESSING" || value === "GENERATING") {
    return "generating";
  }
  return "pending";
}

function getVideoHistoryList(
  data:
    | Awaited<ReturnType<typeof videosApi.fetchVideoHistory>>
    | null
    | undefined,
): VideoGenerationHistoryItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.list ?? [];
}

export function getHistoryVideoUrl(item: VideoGenerationHistoryItem) {
  return firstPresentString(
    item.videoUrl,
    item.video_url,
    item.videoResultUrl,
    item.video_result_url,
    item.resultVideoUrl,
    item.result_video_url,
    item.videoUrls?.find(Boolean),
    item.video_urls?.find(Boolean),
  );
}

function getHistoryPosterUrl(item: VideoGenerationHistoryItem, shot: VideoShot) {
  return firstPresentString(
    item.thumbnailUrl,
    item.thumbnail_url,
    item.lastFrameUrl,
    item.last_frame_url,
    item.coverUrl,
    item.cover_url,
    item.imageUrl,
    item.image_url,
    shot.posterUrl,
  );
}

export function adaptVideoHistory(
  data: Awaited<ReturnType<typeof videosApi.fetchVideoHistory>> | null,
  shot: VideoShot,
): VideoHistoryItem[] {
  const rawItems = getVideoHistoryList(data);
  const completedItems = rawItems
    .filter(
      (item) =>
        normalizeVideoStatus(item.status, item.taskStatus) === "completed",
    )
    .filter((item) => getHistoryVideoUrl(item))
    .reverse();
  const seenUrls = new Set<string>();
  const historyItems = completedItems.flatMap((item) => {
    const videoUrl = getHistoryVideoUrl(item);
    if (!videoUrl || seenUrls.has(videoUrl)) return [];
    seenUrls.add(videoUrl);
    return [
      {
        id: String(item.taskId ?? item.id ?? videoUrl),
        version: seenUrls.size,
        status: "completed" as const,
        videoUrl,
        posterUrl: getHistoryPosterUrl(item, shot),
        isFinal: Boolean(shot.finalVideoUrl && videoUrl === shot.finalVideoUrl),
        prompt:
          firstPresentString(item.prompt, item.videoPrompt, item.video_prompt) ??
          shot.prompt,
        modelId: firstPresentString(item.modelId) ?? null,
        duration: item.duration ?? shot.duration,
        createdTime: item.createdTime ?? null,
        updateTime: item.updateTime ?? null,
      },
    ];
  });

  if (historyItems.length > 0) return historyItems;
  if (!shot.videoUrl) return [];

  return [
    {
      id: `${shot.id}-current`,
      version: 1,
      status: "completed",
      videoUrl: shot.videoUrl,
      posterUrl: shot.posterUrl,
      isFinal: Boolean(
        shot.finalVideoUrl && shot.videoUrl === shot.finalVideoUrl,
      ),
      prompt: shot.prompt,
      modelId: null,
      duration: shot.duration,
      createdTime: null,
      updateTime: null,
    },
  ];
}

export function getFinalVideoMap(
  data:
    | SceneScriptItem[]
    | Awaited<ReturnType<typeof shotsApi.fetchChapterScripts>>
    | null
    | undefined,
) {
  const items = Array.isArray(data)
    ? data
    : "list" in (data ?? {})
      ? (data?.list ?? [])
      : "scripts" in (data ?? {})
        ? ((data as { scripts?: SceneScriptItem[] }).scripts ?? [])
        : [];
  return Object.fromEntries(
    items.map((item) => [
      String(item.id),
      firstPresentString(item.videoResultUrl, item.video_result_url),
    ]),
  ) as Record<string, string | null>;
}

export async function fetchShotPreviewMap(
  shots: VideoShot[],
): Promise<ShotPreviewMap> {
  const previewEntries = await Promise.all(
    shots.map(async (shot) => {
      if (shot.posterUrl || shot.videoUrl || !shot.hasVideo) {
        return [
          shot.id,
          { posterUrl: shot.posterUrl, videoUrl: shot.videoUrl },
        ] as const;
      }

      try {
        const data = await videosApi.fetchVideoHistory({
          businessId: shot.id,
          pageSize: 10,
        });
        const latestCompleted = getVideoHistoryList(data).find(
          (item) =>
            normalizeVideoStatus(item.status, item.taskStatus) ===
              "completed" && getHistoryVideoUrl(item),
        );

        return [
          shot.id,
          {
            posterUrl: latestCompleted
              ? getHistoryPosterUrl(latestCompleted, shot)
              : shot.posterUrl,
            videoUrl: latestCompleted
              ? getHistoryVideoUrl(latestCompleted)
              : shot.videoUrl,
          },
        ] as const;
      } catch {
        return [
          shot.id,
          { posterUrl: shot.posterUrl, videoUrl: shot.videoUrl },
        ] as const;
      }
    }),
  );

  return Object.fromEntries(previewEntries) as ShotPreviewMap;
}

export function getPlayableVideoUrl(url: string) {
  return url.startsWith("/")
    ? url
    : `/api/video-proxy?url=${encodeURIComponent(url)}`;
}

export function formatVideoDuration(seconds: number | null) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatVideoTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}
