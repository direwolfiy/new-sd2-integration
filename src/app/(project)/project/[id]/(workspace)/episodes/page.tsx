"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Image,
  Film,
  Download,
  MoreHorizontal,
  List,
  LayoutGrid,
  Play,
} from "lucide-react";
import { episodesApi, useApi } from "@/lib/api";
import { adaptChapter } from "@/lib/adapters";
import { useParams } from "next/navigation";

const stageLabels = [
  { key: "script", label: "剧本", icon: FileText },
  { key: "storyboard", label: "分镜", icon: Image },
  { key: "video", label: "视频", icon: Film },
  { key: "editor", label: "剪辑", icon: Download },
] as const;

function GridSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-white/[0.12] bg-[#181818] overflow-hidden"
        >
          <div className="aspect-video bg-[#202020] animate-pulse" />
          <div className="px-3 py-2.5 space-y-2">
            <div className="h-3 bg-[#222] rounded animate-pulse w-16" />
            <div className="h-4 bg-[#222] rounded animate-pulse w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EpisodesPage() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: chapters, isLoading } = useApi(
    () => episodesApi.fetchChapters(id),
    [id],
  );

  const episodeList = (chapters ?? []).map((ch) => adaptChapter(ch, id));
  const stageSummary = stageLabels.map((stage) => ({
    ...stage,
    completed: episodeList.filter((episode) => episode.stages[stage.key])
      .length,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/[0.12] bg-[#0d0d0d] px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-medium text-white">分集管理</h2>
                <span className="rounded-md border border-white/[0.12] bg-white/[0.06] px-2 py-0.5 text-[12px] text-[#c7c7c7]">
                  共 {episodeList.length} 集
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[#8f8f8f]">
                按分集顺序推进剧本、分镜、视频和剪辑交付。
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex items-center rounded-md bg-white/[0.08] p-0.5">
                <button
                  onClick={() => setView("grid")}
                  aria-label="网格视图"
                  className={`h-7 w-7 rounded-[5px] flex items-center justify-center transition-colors duration-200 ${
                    view === "grid"
                      ? "bg-white/[0.08] text-white"
                      : "text-[#a3a3a3] hover:text-[#b8b8b8]"
                  }`}
                >
                  <LayoutGrid size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="列表视图"
                  className={`h-7 w-7 rounded-[5px] flex items-center justify-center transition-colors duration-200 ${
                    view === "list"
                      ? "bg-white/[0.08] text-white"
                      : "text-[#a3a3a3] hover:text-[#b8b8b8]"
                  }`}
                >
                  <List size={14} strokeWidth={1.5} />
                </button>
              </div>
              <button className="h-8 px-4 rounded-full bg-[rgba(0,202,224,0.10)] text-[rgba(92,232,245,0.95)] text-[12px] font-medium border border-[rgba(0,202,224,0.22)] flex items-center gap-1.5 hover:bg-[rgba(0,202,224,0.15)] transition-colors duration-200">
                <FileText size={14} strokeWidth={1.5} />
                从总剧本拆分
              </button>
              <button className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-100">
                <Plus size={14} strokeWidth={1.5} />
                空白分集
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {stageSummary.map((stage) => (
              <div
                key={stage.key}
                className="flex items-center justify-between rounded-lg border border-white/[0.10] bg-white/[0.045] px-3 py-2"
              >
                <span className="flex items-center gap-1.5 text-[12px] text-[#cfcfcf]">
                  <stage.icon
                    size={13}
                    strokeWidth={1.6}
                    className="text-[#9f9f9f]"
                  />
                  {stage.label}
                </span>
                <span className="text-[12px] font-medium text-white">
                  {stage.completed}/{episodeList.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        {isLoading ? (
          <GridSkeleton />
        ) : view === "list" ? (
          <div className="mx-auto w-full max-w-[1120px] space-y-2">
            {episodeList.map((episode) => (
              <Link
                key={episode.id}
                href={`/project/${id}/episode/${episode.id}`}
                className="group flex items-center gap-4 p-4 rounded-lg border border-white/[0.12] bg-[#181818] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200"
              >
                <span className="text-[13px] text-[#a3a3a3] w-12 shrink-0">
                  第 {episode.episodeNumber} 集
                </span>
                <span className="text-[15px] font-medium flex-1">
                  {episode.title}
                </span>
                <div className="flex items-center gap-2">
                  {stageLabels.map((stage) => {
                    const completed = episode.stages[stage.key];
                    return (
                      <div
                        key={stage.key}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] ${
                          completed
                            ? "bg-white/[0.10] text-white/60"
                            : "bg-transparent text-[#888]"
                        }`}
                      >
                        <stage.icon size={12} strokeWidth={1.5} />
                        {stage.label}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[12px] text-[#a3a3a3] w-24 text-right shrink-0">
                  {episode.lastEditedAt}
                </span>
                <button className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/[0.10] transition-all duration-200">
                  <MoreHorizontal size={16} strokeWidth={1.5} />
                </button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {episodeList.map((episode) => (
              <Link
                key={episode.id}
                href={`/project/${id}/episode/${episode.id}`}
                className="group rounded-lg border border-white/[0.12] bg-[#181818] overflow-hidden hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200"
              >
                <div className="relative aspect-video bg-[#202020]">
                  {episode.stages.video ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                          <Play
                            size={18}
                            strokeWidth={1.5}
                            className="text-white ml-0.5"
                          />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-2 text-[11px] text-white/70">
                        {episode.duration}
                      </span>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <Film
                        size={20}
                        strokeWidth={1.5}
                        className="text-[#777]"
                      />
                      <span className="text-[11px] text-[#888]">暂无视频</span>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#a3a3a3]">
                      第 {episode.episodeNumber} 集
                    </span>
                    <span className="text-[11px] text-[#888]">
                      {episode.lastEditedAt}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium mt-0.5 truncate">
                    {episode.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
