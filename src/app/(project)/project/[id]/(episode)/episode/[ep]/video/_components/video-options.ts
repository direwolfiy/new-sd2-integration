import type { AiVideoModelConfigDTO } from "@/lib/api/types";

export type VideoChannelOption = {
  id: string;
  modelId: string;
  modelVersion: string;
  label: string;
  shortLabel: string;
  platform: string;
  supportedRatios: string[];
  resolutions: string[];
  durations: string[];
  soundOptions: string[];
  defaultResolution: string;
};

export type VideoModelOption = {
  id: string;
  name: string;
  label: string;
  channels: VideoChannelOption[];
};

export const DEFAULT_VIDEO_CHANNEL: VideoChannelOption = {
  id: "seedance-2.0:default",
  modelId: "seedance-2.0",
  modelVersion: "seedance-2.0",
  label: "默认渠道",
  shortLabel: "默认",
  platform: "Seedance",
  supportedRatios: ["16:9", "9:16"],
  resolutions: ["720p", "1080p"],
  durations: ["5s", "10s"],
  soundOptions: ["有声", "无声"],
  defaultResolution: "720p",
};

export const DEFAULT_VIDEO_MODEL: VideoModelOption = {
  id: "seedance-2.0",
  name: "Seedance 2.0",
  label: "Seedance 2.0",
  channels: [DEFAULT_VIDEO_CHANNEL],
};

export function adaptVideoModelOptions(
  models: AiVideoModelConfigDTO[] | null | undefined,
): VideoModelOption[] {
  const groups = new Map<string, VideoModelOption>();

  for (const model of models ?? []) {
    const modelId = firstPresentString(model.modelId, model.model_id);
    const modelVersion =
      firstPresentString(model.modelVersion, model.model_version, modelId) ??
      "";
    const modelName =
      firstPresentString(model.modelName, model.model_name, modelVersion) ??
      "";
    if (!modelId && !modelVersion && !modelName) continue;

    const familyId = normalizeModelFamilyId(modelName || modelVersion || modelId);
    const familyLabel = normalizeModelFamilyLabel(modelName || modelVersion);
    const channel = createChannelOption(model, modelId, modelVersion);
    const current =
      groups.get(familyId) ??
      ({
        id: familyId,
        name: familyLabel,
        label: familyLabel,
        channels: [],
      } satisfies VideoModelOption);
    current.channels.push(channel);
    groups.set(familyId, current);
  }

  const options = Array.from(groups.values()).map((group) => ({
    ...group,
    channels: normalizeChannelLabels(
      group.channels.sort((a, b) => a.label.localeCompare(b.label)),
    ),
  }));

  return options.length > 0 ? options : [DEFAULT_VIDEO_MODEL];
}

function createChannelOption(
  model: AiVideoModelConfigDTO,
  modelId: string | null,
  modelVersion: string,
): VideoChannelOption {
  const qualityLevels = parseStringArray(
    model.qualityLevels ?? model.quality_levels,
  );
  const defaultQuality = firstPresentString(
    model.defaultQuality,
    model.default_quality,
  );
  const resolutions =
    qualityLevels.length > 0
      ? qualityLevels
      : getResolutionOptions(model.maxResolution ?? model.max_resolution);
  const defaultResolution =
    defaultQuality && resolutions.includes(defaultQuality)
      ? defaultQuality
      : resolutions[0];
  const durations = getDurationOptions(
    model.supportedDurations ?? model.supported_durations,
    model.minDuration ?? model.min_duration,
    model.maxDuration ?? model.max_duration,
  );
  const soundOptions = getSoundOptions(
    model.supportAudioModes ?? model.support_audio_modes,
  );
  const platform = firstPresentString(model.platform) ?? "渠道";
  const channelLabel = getChannelLabel(model, platform);
  const versionLabel =
    firstPresentString(model.modelVersion, model.model_version) ?? modelVersion;

  return {
    id: firstPresentString(model.id, modelVersion, modelId) ?? versionLabel,
    modelId: modelId ?? modelVersion,
    modelVersion,
    label: channelLabel,
    shortLabel: channelLabel,
    platform,
    supportedRatios:
      parseStringArray(model.supportedRatios ?? model.supported_ratios)
        .length > 0
        ? parseStringArray(model.supportedRatios ?? model.supported_ratios)
        : DEFAULT_VIDEO_CHANNEL.supportedRatios,
    resolutions,
    durations,
    soundOptions,
    defaultResolution,
  };
}

function firstPresentString(
  ...values: Array<string | number | null | undefined>
) {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalizeModelFamilyId(value: string | null) {
  const text = String(value ?? "seedance-2.0").toLowerCase();
  if (text.includes("seedance") || text.includes("doubao")) {
    return "seedance-2.0";
  }
  return text.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizeModelFamilyLabel(value: string | null) {
  const text = String(value ?? "").trim();
  if (/seedance|doubao/i.test(text)) return "Seedance 2.0";
  return text || DEFAULT_VIDEO_MODEL.label;
}

function normalizeChannelLabels(channels: VideoChannelOption[]) {
  const labelCounts = channels.reduce<Record<string, number>>(
    (counts, channel) => ({
      ...counts,
      [channel.label]: (counts[channel.label] ?? 0) + 1,
    }),
    {},
  );
  const labelIndexes: Record<string, number> = {};
  return channels.map((channel) => {
    if ((labelCounts[channel.label] ?? 0) <= 1) return channel;
    labelIndexes[channel.label] = (labelIndexes[channel.label] ?? 0) + 1;
    const label = `${channel.label} ${labelIndexes[channel.label]}`;
    return {
      ...channel,
      label,
      shortLabel: label,
    };
  });
}

function getChannelLabel(model: AiVideoModelConfigDTO, fallback: string) {
  const marker = getChannelMarker(
    model.modelType,
    model.model_type,
    model.modelName,
    model.model_name,
    model.modelId,
    model.model_id,
    model.modelVersion,
    model.model_version,
  );
  if (marker) return marker;
  return formatPlatformLabel(fallback);
}

function getChannelMarker(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (!text) continue;
    if (/(^|[^a-z])th([^a-z]|$)/i.test(text)) return "TH";
    if (/(^|[^a-z])pq([^a-z]|$)/i.test(text)) return "PQ";
  }
  return null;
}

function formatPlatformLabel(value: string) {
  const text = value.trim();
  if (!text) return "渠道";
  return text
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getResolutionOptions(maxResolution?: string | null) {
  const value = String(maxResolution ?? "").toLowerCase();
  if (value.includes("4k")) return ["720p", "1080p", "4K"];
  if (value.includes("1080") || value.includes("fhd")) return ["720p", "1080p"];
  return DEFAULT_VIDEO_CHANNEL.resolutions;
}

function getDurationOptions(
  supportedDurations?: number[] | null,
  minDuration?: number | null,
  maxDuration?: number | null,
) {
  if (supportedDurations?.length) {
    return supportedDurations.map((duration) => `${duration}s`);
  }
  const min = Number(minDuration);
  const max = Number(maxDuration);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min) {
    return [min, max]
      .filter((duration, index, array) => array.indexOf(duration) === index)
      .map((duration) => `${duration}s`);
  }
  return DEFAULT_VIDEO_CHANNEL.durations;
}

function getSoundOptions(supportAudioModes?: number[] | null) {
  if (!supportAudioModes?.length) return DEFAULT_VIDEO_CHANNEL.soundOptions;
  const options = supportAudioModes.flatMap((mode) => {
    if (mode === 0) return ["无声"];
    if (mode === 1) return ["有声"];
    return [];
  });
  return options.length > 0 ? options : DEFAULT_VIDEO_CHANNEL.soundOptions;
}

export function getOptionValue(value: string, options: string[]) {
  return options.includes(value) ? value : options[0];
}
