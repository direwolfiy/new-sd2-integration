// TODO: [mock] replace with API types

export type ProjectStatus = "进行中" | "已完结" | "已归档";

export interface Project {
  id: string;
  name: string;
  coverUrl: string;
  status: ProjectStatus;
  progress: number;
  completedEpisodes: number;
  totalEpisodes: number;
  lastEditedAt: string;
  lastEditedBy: string;
  createdAt: string;
  genre: string;
  creativeType: string;
  description: string;
}

export type EpisodeStage = "script" | "storyboard" | "video" | "editor";

export interface Episode {
  id: string;
  projectId: string;
  episodeNumber: number;
  title: string;
  stages: Record<EpisodeStage, boolean>;
  duration: string;
  lastEditedAt: string;
}

export type ElementType =
  | "character"
  | "scene"
  | "prop"
  | "material"
  | "audio"
  | "script";

export interface ElementItem {
  id: string;
  projectId: string;
  type: ElementType;
  name: string;
  thumbnailUrl: string;
  tags: string[];
  variants?: string[];
  createdAt: string;
  wordCount?: number;
}

export interface CharacterImage {
  id: string;
  name: string;
  url: string | null;
  isPrimary: boolean;
}

export interface CharacterVariant {
  id: string;
  name: string;
  description: string;
  episodes: number[];
  images: CharacterImage[];
}

export interface CharacterInfoDetail {
  bio: string;
  voiceDescription: string;
}

export interface SceneImage {
  id: string;
  name: string;
  url: string | null;
  isPrimary: boolean;
}

export interface SceneState {
  id: string;
  name: string;
  description: string;
  episodes: number[];
  images: SceneImage[];
}

export interface SceneInfoDetail {
  location: string;
  mood: string;
}

export type AssetType = "image" | "video" | "audio";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  thumbnailUrl: string;
  sourceProject: string;
  createdAt: string;
}

export interface ScriptMetadata {
  genre: string;
  summary: string;
  totalWordCount: number;
  episodeCount: number;
  tags: string[];
}

export interface ScriptEpisode {
  id?: string;
  episodeNumber: number;
  title: string;
  summary: string;
  content: string;
  wordCount: number;
  characters: string[];
}

export interface StoryboardShot {
  id: string;
  episodeId: string;
  shotNumber: number;
  description: string;
  thumbnailUrl: string | null;
  referenceElements: { type: ElementType; name: string }[];
  duration: string;
  status: "draft" | "generated" | "approved";
}

export interface VideoClip {
  id: string;
  episodeId: string;
  shotNumber: number;
  thumbnailUrl: string | null;
  prompt: string;
  status: "pending" | "generating" | "completed";
  duration: string;
  versions: number;
}

export interface Shot {
  id: string;
  episodeId: string;
  number: number;
  description: string;
  prompt: string;
  hasImage: boolean;
  hasVideo: boolean;
  videoStatus: "pending" | "generating" | "completed";
  videoVersions: number;
  duration: string;
  elements: { type: string; name: string }[];
}

export interface VideoVersion {
  id: string;
  shotId: string;
  version: number;
  status: "pending" | "generating" | "completed";
  duration: string;
  createdAt: string;
  prompt: string;
}

export interface ScriptData {
  projectId: string;
  rawContent: string | null;
  metadata: ScriptMetadata | null;
  episodes: ScriptEpisode[] | null;
  lastEditedBy: string | null;
  lastEditedAt: string | null;
}
