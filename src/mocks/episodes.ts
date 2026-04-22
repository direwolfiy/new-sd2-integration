import { Episode } from "./types";

// TODO: [mock] replace with API call
export const episodes: Episode[] = [
  {
    id: "ep-1-1",
    projectId: "proj-1",
    episodeNumber: 1,
    title: "初入秦村",
    stages: { script: true, storyboard: true, video: true, export: true },
    duration: "03:25",
    lastEditedAt: "2 天前",
  },
  {
    id: "ep-1-2",
    projectId: "proj-1",
    episodeNumber: 2,
    title: "先天不足",
    stages: { script: true, storyboard: true, video: true, export: true },
    duration: "03:40",
    lastEditedAt: "1 天前",
  },
  {
    id: "ep-1-3",
    projectId: "proj-1",
    episodeNumber: 3,
    title: "星辰之力",
    stages: { script: true, storyboard: true, video: true, export: false },
    duration: "—",
    lastEditedAt: "6 小时前",
  },
  {
    id: "ep-1-4",
    projectId: "proj-1",
    episodeNumber: 4,
    title: "暗流涌动",
    stages: { script: true, storyboard: true, video: false, export: false },
    duration: "—",
    lastEditedAt: "10 分钟前",
  },
  {
    id: "ep-1-5",
    projectId: "proj-1",
    episodeNumber: 5,
    title: "九剑仙府",
    stages: { script: true, storyboard: false, video: false, export: false },
    duration: "—",
    lastEditedAt: "昨天",
  },
  {
    id: "ep-1-6",
    projectId: "proj-1",
    episodeNumber: 6,
    title: "暴风前夕",
    stages: { script: false, storyboard: false, video: false, export: false },
    duration: "—",
    lastEditedAt: "昨天",
  },
  {
    id: "ep-2-1",
    projectId: "proj-2",
    episodeNumber: 1,
    title: "午夜信号",
    stages: { script: true, storyboard: true, video: true, export: true },
    duration: "04:10",
    lastEditedAt: "3 天前",
  },
  {
    id: "ep-2-2",
    projectId: "proj-2",
    episodeNumber: 2,
    title: "消失的楼层",
    stages: { script: true, storyboard: true, video: false, export: false },
    duration: "—",
    lastEditedAt: "2 小时前",
  },
  {
    id: "ep-3-1",
    projectId: "proj-3",
    episodeNumber: 1,
    title: "开学第一天",
    stages: { script: true, storyboard: true, video: true, export: true },
    duration: "02:55",
    lastEditedAt: "1 周前",
  },
  {
    id: "ep-3-2",
    projectId: "proj-3",
    episodeNumber: 2,
    title: "秘密武器",
    stages: { script: true, storyboard: true, video: true, export: true },
    duration: "03:10",
    lastEditedAt: "5 天前",
  },
];

export function getEpisodesByProject(projectId: string): Episode[] {
  return episodes.filter((ep) => ep.projectId === projectId);
}

export function getEpisodeById(id: string): Episode | undefined {
  return episodes.find((ep) => ep.id === id);
}
