/**
 * Shot bridge — converts episode shot data into OpenReel MediaItems.
 * So users can see their AI-generated shot materials in the editor's asset panel.
 */
import type { MediaItem } from "@openreel/core";
import { fetchChapterScripts } from "@/lib/api/shots";
import { fetchVideoHistory } from "@/lib/api/videos";
import type { SceneScriptItem } from "@/lib/api/types";

/** Backend returns snake_case fields; map to frontend camelCase */
interface RawShot {
  id: string;
  order_sort: number;
  title?: string;
  body?: string;
  video_result_url?: string | null;
  image_result_url?: string | null;
  duration_seconds?: number | null;
  audio_result_url?: string | null;
}

function rawShotToSceneScriptItem(r: RawShot): SceneScriptItem {
  let description = "";
  if (r.body) {
    try {
      const parsed = JSON.parse(r.body);
      description = parsed.content ?? parsed.rawDescription ?? "";
    } catch { /* ignore parse errors */ }
  }
  return {
    id: r.id,
    chapterId: "",
    sortOrder: r.order_sort ?? 0,
    scriptContent: r.title ?? description,
    imagePrompt: null,
    videoPrompt: null,
    imageUrl: r.image_result_url ?? null,
    videoUrl: r.video_result_url ?? null,
    videoStatus: null,
    duration: r.duration_seconds ?? null,
    createdAt: null,
    updatedAt: null,
  };
}

export interface ShotMediaGroup {
  shotSortOrder: number;
  shotDescription: string;
  items: MediaItem[];
}

/**
 * Stable hash for a URL — same URL always produces the same short string.
 * Used as part of MediaItem ID so the ID doesn't change when version numbers shift.
 */
function urlHash(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = ((h << 5) - h + url.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

/**
 * Probe a video URL for its native resolution using a hidden <video> element.
 * Only downloads enough bytes to parse the container header (~tens of KB).
 */
function probeVideoResolution(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      video.remove();
      resolve(null);
    }, 8000);

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    // Use proxy for CORS
    video.src = url.startsWith("/") ? url : `/api/video-proxy?url=${encodeURIComponent(url)}`;

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const w = video.videoWidth;
      const h = video.videoHeight;
      video.src = "";
      video.remove();
      if (w > 0 && h > 0) {
        resolve({ width: w, height: h });
      } else {
        resolve(null);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      video.remove();
      resolve(null);
    };
  });
}

/**
 * Fetch all shots for an episode and convert their video versions to MediaItems,
 * grouped by shot number for display in the asset panel.
 */
export async function loadShotMediaItems(
  episodeId: string,
): Promise<{ groups: ShotMediaGroup[]; allItems: MediaItem[] }> {
  const rawShots = await fetchChapterScripts(episodeId);
  // Backend returns { scripts: RawShot[], storySummary, roleList, generationMeta }
  const data = rawShots as { scripts?: RawShot[] } | RawShot[];
  const rawList: RawShot[] = Array.isArray(data)
    ? data
    : (data as { scripts?: RawShot[] }).scripts ?? [];
  const shotList = rawList.map(rawShotToSceneScriptItem);

  console.log(`[ShotBridge] Fetched ${shotList.length} shots for episode ${episodeId}`);

  const groups: ShotMediaGroup[] = [];

  for (const shot of shotList) {
    const sortOrder = shot.sortOrder;
    if (!sortOrder) continue; // skip shots without proper sort order

    const shotLabel = rawList.find((r: RawShot) => r.id === shot.id)?.title
      ?? `Shot #${sortOrder}`;

    // Try to get version history; fall back to shot's own video URL
    let versions: { url: string | null; version: number; status: string; duration: number | null; thumbnailUrl?: string | null }[] = [];

    try {
      const historyData = await fetchVideoHistory({ businessId: String(shot.id) });
      // History API returns paginated: { list: [...], total: N } or plain array
      const rawList = Array.isArray(historyData)
        ? historyData
        : (historyData as { list?: unknown[] })?.list ?? [];
      // API returns newest-first; reverse so earliest generation is v1
      const completedRaw = (rawList as Record<string, unknown>[])
        .filter((v: Record<string, unknown>) => v.status === "COMPLETED" && v.videoUrl)
        .reverse();
      const completedVersions = completedRaw.map((v: Record<string, unknown>, i: number) => ({
        url: v.videoUrl as string,
        version: i + 1,
        status: "completed" as const,
        duration: v.duration as number ?? null,
        thumbnailUrl: (v.lastFrameUrl ?? v.thumbnailUrl ?? shot.imageUrl) as string | null,
      }));
      if (completedVersions.length > 0) {
        versions = completedVersions;
      }
    } catch {
      // Fallback: no version history available
    }

    if (versions.length === 0 && shot.videoUrl) {
      console.log(`[ShotBridge] Shot ${sortOrder}: no history, using direct videoUrl, thumbnail=${shot.imageUrl ?? "none"}`);
      versions = [{
        url: shot.videoUrl,
        version: 1,
        status: shot.videoStatus ?? "completed",
        duration: shot.duration ?? null,
        thumbnailUrl: shot.imageUrl,
      }];
    }

    if (versions.length === 0) continue;

    // Probe resolutions in parallel (only downloads container headers)
    const uniqueUrls = [...new Set(versions.filter((v) => v.url).map((v) => v.url!))];
    const resolutionMap = new Map<string, { width: number; height: number } | null>();
    await Promise.all(
      uniqueUrls.map(async (url) => {
        const res = await probeVideoResolution(url);
        resolutionMap.set(url, res);
      }),
    );

    const items: MediaItem[] = versions
      .filter((v) => v.url && v.status !== "generating")
      .map((v) => {
        const mediaId = `shot-${shot.id}-${urlHash(v.url!)}`;
        const durationSec = v.duration ?? 0;
        const thumb = v.thumbnailUrl ?? shot.imageUrl ?? null;
        const resolution = resolutionMap.get(v.url!) ?? null;

        console.log(`[ShotBridge] Shot ${sortOrder} v${v.version}: thumbnail=${thumb ? "yes" : "NO"}, resolution=${resolution ? `${resolution.width}x${resolution.height}` : "unknown"}`);

        return {
          id: mediaId,
          name: `${shotLabel} v${v.version}`,
          type: "video" as const,
          fileHandle: null,
          blob: null,
          metadata: {
            duration: durationSec,
            width: resolution?.width ?? 1920,
            height: resolution?.height ?? 1080,
            frameRate: 30,
            codec: "",
            sampleRate: 0,
            channels: 0,
            fileSize: 0,
          },
          thumbnailUrl: thumb,
          waveformData: null,
          originalUrl: v.url ?? undefined,
          isPlaceholder: false,
        };
      });

    if (items.length > 0) {
      groups.push({ shotSortOrder: sortOrder, shotDescription: shotLabel, items });
    }
  }

  const allItems = groups.flatMap((g) => g.items);
  return { groups, allItems };
}
