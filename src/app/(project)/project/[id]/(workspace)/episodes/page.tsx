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
import { getEpisodesByProject } from "@/mocks/episodes";
import { projects } from "@/mocks/projects";
import { useParams } from "next/navigation";

const stageLabels = [
  { key: "script", label: "剧本", icon: FileText },
  { key: "storyboard", label: "分镜", icon: Image },
  { key: "video", label: "视频", icon: Film },
  { key: "export", label: "导出", icon: Download },
] as const;

export default function EpisodesPage() {
  const [view, setView] = useState<"list" | "grid">("grid");
  const params = useParams<{ id: string }>();
  const id = params.id;
  const project = projects.find((p) => p.id === id);
  const episodeList = getEpisodesByProject(id);

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-medium">
            分集管理
            <span className="text-[#666] ml-2 text-[13px]">
              {project?.name} · 共 {episodeList.length} 集
            </span>
          </h2>
          <div className="flex items-center bg-white/[0.04] rounded-md p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`h-7 w-7 rounded-[5px] flex items-center justify-center transition-colors duration-200 ${
                view === "grid"
                  ? "bg-white/[0.08] text-white"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`h-7 w-7 rounded-[5px] flex items-center justify-center transition-colors duration-200 ${
                view === "list"
                  ? "bg-white/[0.08] text-white"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              <List size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 rounded-full bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] text-[12px] font-medium border border-[rgba(0,202,224,0.15)] flex items-center gap-1.5 hover:bg-[rgba(0,202,224,0.12)] transition-colors duration-200">
            <FileText size={14} strokeWidth={1.5} />
            从总剧本拆分
          </button>
          <button className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-100">
            <Plus size={14} strokeWidth={1.5} />
            空白分集
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto p-6">
        {view === "list" ? (
          <div className="max-w-4xl mx-auto space-y-2">
            {episodeList.map((episode) => (
              <Link
                key={episode.id}
                href={`/project/${id}/episode/${episode.id}`}
                className="group flex items-center gap-4 p-4 rounded-lg border border-white/[0.06] bg-[#141414] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200"
              >
                <span className="text-[13px] text-[#666] w-12 shrink-0">
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
                            ? "bg-white/[0.06] text-white/60"
                            : "bg-transparent text-[#444]"
                        }`}
                      >
                        <stage.icon size={12} strokeWidth={1.5} />
                        {stage.label}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[12px] text-[#666] w-24 text-right shrink-0">
                  {episode.lastEditedAt}
                </span>
                <button className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-all duration-200">
                  <MoreHorizontal size={16} strokeWidth={1.5} />
                </button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {episodeList.map((episode) => (
              <Link
                key={episode.id}
                href={`/project/${id}/episode/${episode.id}`}
                className="group rounded-lg border border-white/[0.06] bg-[#141414] overflow-hidden hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200"
              >
                {/* 视频主体 */}
                <div className="relative aspect-video bg-[#1a1a1a]">
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
                      <Film size={20} strokeWidth={1.5} className="text-[#333]" />
                      <span className="text-[11px] text-[#444]">暂无视频</span>
                    </div>
                  )}
                </div>
                {/* 信息栏 */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#666]">
                      第 {episode.episodeNumber} 集
                    </span>
                    <span className="text-[11px] text-[#444]">
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
