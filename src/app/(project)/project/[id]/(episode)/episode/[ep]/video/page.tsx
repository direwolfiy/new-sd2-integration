"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Play, Film, BookOpen, ChevronRight, Clock } from "lucide-react";
import { getShotsByEpisode } from "@/mocks/shots";
import { episodesApi, useApi } from "@/lib/api";
import { VideoShotOverlay } from "@/components/video-shot-overlay";
import { useParams } from "next/navigation";

const statusConfig = {
  pending: { label: "待生成", style: "bg-white/[0.04] text-[#666]" },
  generating: { label: "生成中", style: "bg-[rgba(0,202,224,0.08)] text-[#00CAE0]" },
  completed: { label: "已完成", style: "bg-white/[0.08] text-white/60" },
};

export default function VideoPage() {
  const [overlayShotId, setOverlayShotId] = useState<string | null>(null);
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;

  const { data: chapter } = useApi(
    () => episodesApi.fetchChapter(episodeId),
    [episodeId],
  );

  const hasScript = !!chapter?.chapterContent;
  const shots = getShotsByEpisode(episodeId);
  const hasStoryboard = shots.length > 0;

  if (!hasScript) {
    const storyboardHref = `/project/${projectId}/episode/${episodeId}/storyboard`;
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
            <BookOpen size={24} strokeWidth={1.5} className="text-[#333]" />
          </div>
          <div className="text-center">
            <p className="text-[15px] text-[#666]">该分集尚无内容</p>
            <p className="text-[13px] text-[#444] mt-1">请先在分镜中为该分集添加剧本或镜头</p>
          </div>
          <Link
            href={storyboardHref}
            className="mt-1 h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-2 hover:bg-white/90 active:scale-[0.97] transition-all duration-100"
          >
            前往分镜
          </Link>
        </div>
      </div>
    );
  }

  if (!hasStoryboard) {
    const storyboardHref = `/project/${projectId}/episode/${episodeId}/storyboard`;
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
            <Film size={24} strokeWidth={1.5} className="text-[#333]" />
          </div>
          <div className="text-center">
            <p className="text-[15px] text-[#666]">请先完成分镜</p>
            <p className="text-[13px] text-[#444] mt-1">视频需要基于分镜镜头逐个生成</p>
          </div>
          <Link
            href={storyboardHref}
            className="mt-1 h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-2 hover:bg-white/90 active:scale-[0.97] transition-all duration-100"
          >
            前往分镜
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <span className="text-[13px] text-[#666]">
          {shots.length} 个镜头
          <span className="mx-1.5">·</span>
          {shots.filter((s) => s.videoStatus === "completed").length} 已完成
          <span className="mx-1.5">·</span>
          {shots.filter((s) => s.videoStatus === "generating").length} 生成中
        </span>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 rounded-full bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] text-[12px] font-medium border border-[rgba(0,202,224,0.15)] flex items-center gap-1.5 hover:bg-[rgba(0,202,224,0.12)] transition-colors duration-200">
            <Sparkles size={14} strokeWidth={1.5} />
            批量生成视频
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-1.5">
          {shots.map((shot) => {
            const config = statusConfig[shot.videoStatus];
            return (
              <button
                key={shot.id}
                onClick={() => setOverlayShotId(shot.id)}
                className="group w-full flex items-center gap-4 p-3 rounded-lg border border-white/[0.06] bg-[#141414] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 text-left"
              >
                <span className="text-[13px] text-[#666] w-14 shrink-0">
                  镜头 {shot.number}
                </span>
                <div className="w-20 h-12 rounded bg-[#262626] border border-white/[0.06] shrink-0 flex items-center justify-center">
                  {shot.hasVideo ? (
                    <Play size={16} strokeWidth={1.5} className="text-[#00CAE0]" />
                  ) : shot.videoStatus === "generating" ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin" />
                  ) : (
                    <span className="text-[10px] text-[#444]">无视频</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#999] leading-[1.6] truncate">
                    {shot.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {shot.elements.map((el) => (
                      <span
                        key={el.name}
                        className="px-1.5 py-0.5 rounded-full bg-[#00CAE0]/10 text-[#00CAE0] text-[10px]"
                      >
                        {el.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[12px] text-[#666]">
                    <Clock size={12} strokeWidth={1.5} />
                    {shot.duration}
                  </span>
                  {shot.videoVersions > 0 && (
                    <span className="text-[11px] text-[#666] bg-white/[0.04] px-1.5 py-0.5 rounded">
                      v{shot.videoVersions}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${config.style}`}>
                    {config.label}
                  </span>
                  <ChevronRight size={14} strokeWidth={1.5} className="text-[#444]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <VideoShotOverlay
        open={overlayShotId !== null}
        onClose={() => setOverlayShotId(null)}
        shots={shots}
        initialShotId={overlayShotId ?? shots[0]?.id ?? ""}
      />
    </div>
  );
}
