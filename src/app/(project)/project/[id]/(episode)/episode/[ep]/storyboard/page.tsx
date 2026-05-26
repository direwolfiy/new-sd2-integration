"use client";

import Link from "next/link";
import {
  GripVertical,
  Plus,
  Sparkles,
  MessageSquare,
  Image,
  BookOpen,
  Coins,
  FileText,
  PenLine,
  LayoutGrid,
} from "lucide-react";
import { calcStoryboardCost } from "@/lib/pricing";
import { episodesApi, shotsApi, useApi } from "@/lib/api";
import { adaptShot } from "@/lib/adapters";
import type { Shot } from "@/mocks/types";
import type { SceneScriptItem } from "@/lib/api/types";
import { useParams } from "next/navigation";

const statusStyles = {
  draft: "bg-white/[0.04] text-[#666]",
  generated: "bg-[#00CAE0]/10 text-[#00CAE0]",
  approved: "bg-white/[0.08] text-white/60",
};

const statusLabels = {
  draft: "草稿",
  generated: "已生成",
  approved: "已确认",
};

function getShotStoryboardStatus(shot: Shot): "draft" | "generated" | "approved" {
  if (!shot.hasImage) return "draft";
  if (shot.videoStatus === "completed") return "approved";
  return "generated";
}

const entryOptions = [
  {
    icon: FileText,
    title: "选择分集剧本",
    description: "从项目总剧本中选择该分集的内容",
  },
  {
    icon: PenLine,
    title: "输入剧本",
    description: "粘贴或手动输入该分集的剧本",
  },
  {
    icon: LayoutGrid,
    title: "自定义分镜",
    description: "跳过剧本，直接手动创建镜头",
  },
];

function EmptyNoScript() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <p className="text-[15px] text-[#666]">为该分集添加内容</p>
        <p className="text-[13px] text-[#444] mt-1">选择一种方式开始创作</p>
      </div>
      <div className="flex items-start gap-3">
        {entryOptions.map((opt) => (
          <button
            key={opt.title}
            className="group w-44 flex flex-col items-center gap-3 p-5 rounded-xl border border-white/[0.06] bg-[#141414] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] hover:border-white/[0.12] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center transition-colors duration-200">
              <opt.icon size={20} strokeWidth={1.5} className="text-[#666] group-hover:text-[#999]" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-[#ccc] group-hover:text-white">{opt.title}</p>
              <p className="text-[12px] text-[#555] mt-1 leading-[1.5]">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyHasScript({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <span className="text-[13px] text-[#666]">尚未生成分镜</span>
        <button className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-100">
          <Sparkles size={14} strokeWidth={1.5} />
          AI 生成分镜
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
          <Image size={24} strokeWidth={1.5} className="text-[#333]" />
        </div>
        <div className="text-center">
          <p className="text-[15px] text-[#666]">可以从剧本自动生成分镜</p>
          <p className="text-[13px] text-[#444] mt-1">
            AI 将根据剧本内容拆分镜头、生成画面描述和提示词
          </p>
        </div>
        <button className="mt-2 h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-2 hover:bg-white/90 active:scale-[0.97] transition-all duration-100">
          <Sparkles size={16} strokeWidth={1.5} />
          AI 生成分镜
        </button>
      </div>
    </div>
  );
}

function ShotList({
  shots,
  projectId,
  episodeId,
}: {
  shots: Shot[];
  projectId: string;
  episodeId: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#666]">{shots.length} 个镜头</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 rounded-full bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] text-[12px] font-medium border border-[rgba(0,202,224,0.15)] flex items-center gap-1.5 hover:bg-[rgba(0,202,224,0.12)] transition-colors duration-200">
            <Sparkles size={14} strokeWidth={1.5} />
            AI 生成分镜
            <span className="text-[rgba(0,202,224,0.5)] ml-0.5">{calcStoryboardCost(shots.length)}分</span>
          </button>
          <button className="h-8 px-4 rounded-full bg-white/[0.06] text-white text-[12px] flex items-center gap-1.5 hover:bg-white/[0.1] transition-colors duration-200">
            <Plus size={14} strokeWidth={1.5} />
            添加镜头
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-1.5">
          {shots.map((shot) => {
            const status = getShotStoryboardStatus(shot);
            return (
              <div
                key={shot.id}
                className="group flex items-start gap-3 p-3 rounded-lg border border-white/[0.06] bg-[#141414] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 cursor-pointer"
              >
                <div className="pt-1 text-[#444] cursor-grab">
                  <GripVertical size={16} strokeWidth={1.5} />
                </div>
                <span className="text-[13px] text-[#666] w-14 shrink-0 pt-0.5">
                  镜头 {shot.number}
                </span>
                <div className="w-16 h-10 rounded bg-[#262626] border border-white/[0.06] shrink-0 flex items-center justify-center">
                  {shot.hasImage ? (
                    <Image size={16} strokeWidth={1.5} className="text-[#00CAE0]" />
                  ) : (
                    <span className="text-[10px] text-[#444]">无图</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#ccc] leading-[1.6] line-clamp-2">
                    {shot.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
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
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span className="text-[12px] text-[#666]">{shot.duration}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[status]}`}>
                    {statusLabels[status]}
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-all duration-200 shrink-0">
                  <MessageSquare size={14} strokeWidth={1.5} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StoryboardPage() {
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;

  const { data: chapter } = useApi(
    () => episodesApi.fetchChapter(episodeId),
    [episodeId],
  );

  const { data: sceneScripts, isLoading: shotsLoading } = useApi(
    () => shotsApi.fetchChapterScripts(episodeId),
    [episodeId],
  );
  const rawScripts = sceneScripts ?? [];
  const list: SceneScriptItem[] = Array.isArray(rawScripts) ? rawScripts : (rawScripts as { list?: SceneScriptItem[] }).list ?? [];
  const shots: Shot[] = list.map((item) => adaptShot(item, episodeId));

  const hasScript = !!chapter?.chapterContent;
  const hasStoryboard = shots.length > 0;

  if (!hasScript) {
    return (
      <div className="flex flex-col h-full">
        <EmptyNoScript />
      </div>
    );
  }

  if (shotsLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!hasStoryboard) {
    return <EmptyHasScript projectId={projectId} />;
  }

  return (
    <ShotList shots={shots} projectId={projectId} episodeId={episodeId} />
  );
}
