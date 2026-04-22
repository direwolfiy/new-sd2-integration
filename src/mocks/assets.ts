import { Asset } from "./types";

// TODO: [mock] replace with API call
export const assets: Asset[] = [
  {
    id: "asset-1",
    name: "秦羽 — 星辰觉醒",
    type: "image",
    thumbnailUrl: "/assets/asset-1.jpg",
    sourceProject: "星辰变",
    createdAt: "2025-12-18",
  },
  {
    id: "asset-2",
    name: "九剑仙府全景",
    type: "image",
    thumbnailUrl: "/assets/asset-2.jpg",
    sourceProject: "星辰变",
    createdAt: "2025-12-19",
  },
  {
    id: "asset-3",
    name: "秦羽 vs 暗影守卫",
    type: "image",
    thumbnailUrl: "/assets/asset-3.jpg",
    sourceProject: "星辰变",
    createdAt: "2026-01-02",
  },
  {
    id: "asset-4",
    name: "姜立仙装设计稿",
    type: "image",
    thumbnailUrl: "/assets/asset-4.jpg",
    sourceProject: "星辰变",
    createdAt: "2026-01-05",
  },
  {
    id: "asset-5",
    name: "第 1 集成片",
    type: "video",
    thumbnailUrl: "/assets/asset-5.jpg",
    sourceProject: "星辰变",
    createdAt: "2026-01-10",
  },
  {
    id: "asset-6",
    name: "第 2 集成片",
    type: "video",
    thumbnailUrl: "/assets/asset-6.jpg",
    sourceProject: "星辰变",
    createdAt: "2026-01-12",
  },
  {
    id: "asset-7",
    name: "废弃地铁站氛围镜头",
    type: "video",
    thumbnailUrl: "/assets/asset-7.jpg",
    sourceProject: "都市暗影",
    createdAt: "2026-02-05",
  },
  {
    id: "asset-8",
    name: "古风 BGM — 悠远（终版）",
    type: "audio",
    thumbnailUrl: "/assets/asset-8.jpg",
    sourceProject: "星辰变",
    createdAt: "2025-12-22",
  },
  {
    id: "asset-9",
    name: "战斗音效包 v2",
    type: "audio",
    thumbnailUrl: "/assets/asset-9.jpg",
    sourceProject: "星辰变",
    createdAt: "2026-01-08",
  },
  {
    id: "asset-10",
    name: "林默 — 便装概念图",
    type: "image",
    thumbnailUrl: "/assets/asset-10.jpg",
    sourceProject: "都市暗影",
    createdAt: "2026-01-22",
  },
  {
    id: "asset-11",
    name: "午夜城市全景",
    type: "image",
    thumbnailUrl: "/assets/asset-11.jpg",
    sourceProject: "都市暗影",
    createdAt: "2026-01-28",
  },
  {
    id: "asset-12",
    name: "食堂外观设计",
    type: "image",
    thumbnailUrl: "/assets/asset-12.jpg",
    sourceProject: "食堂争霸",
    createdAt: "2025-11-05",
  },
];

export function getAssetsByType(type?: string): Asset[] {
  if (!type || type === "all") return assets;
  return assets.filter((a) => a.type === type);
}
