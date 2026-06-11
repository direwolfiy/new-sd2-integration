export type VideoShot = {
  id: string;
  number: number;
  description: string;
  prompt: string;
  duration: number | null;
  hasVideo: boolean;
  videoCount: number;
  posterUrl: string | null;
  videoUrl: string | null;
  finalVideoUrl: string | null;
};

export type VideoHistoryItem = {
  id: string;
  version: number;
  status: "pending" | "generating" | "completed";
  videoUrl: string | null;
  posterUrl: string | null;
  isFinal: boolean;
  prompt: string | null;
  modelId: string | null;
  duration: number | null;
  createdTime: string | null;
  updateTime: string | null;
};

export type ImageHistoryItem = {
  id: string;
  version: number;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl: string | null;
  prompt: string | null;
  modelId: string | null;
  createdTime: string | null;
  updateTime: string | null;
};

export type ShotPreviewMap = Record<
  string,
  Pick<VideoShot, "posterUrl" | "videoUrl">
>;
