"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ArrowLeft, LayoutGrid, Film, Download, Sparkles, BookOpen, ChevronRight, ChevronDown } from "lucide-react";
import { projectsApi, episodesApi, scriptsApi, useApi } from "@/lib/api";
import { adaptScriptMetadata, adaptScriptEpisode } from "@/lib/adapters";
import type { ScriptData } from "@/mocks/types";
import { ScriptOverlay } from "@/components/script-overlay";
import { HeaderUserArea } from "@/components/header-user-area";

const stages = [
  { href: "/storyboard", label: "分镜", key: "storyboard", icon: LayoutGrid },
  { href: "/video", label: "视频", key: "video", icon: Film },
  { href: "/editor", label: "剪辑", key: "editor", icon: Download },
];

export default function EpisodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;

  const { data: project } = useApi(() => projectsApi.fetchProject(projectId), [projectId]);
  const { data: chapter } = useApi(() => episodesApi.fetchChapter(episodeId), [episodeId]);
  const { data: projectScriptData } = useApi(() => scriptsApi.fetchProjectScript(projectId), [projectId]);

  const script: ScriptData | null = projectScriptData ? {
    projectId,
    rawContent: projectScriptData.content.script ?? null,
    metadata: projectScriptData.content.script ? adaptScriptMetadata(projectScriptData.content, projectScriptData.chapters) : null,
    episodes: projectScriptData.content.script ? projectScriptData.chapters.map(adaptScriptEpisode) : null,
    lastEditedBy: projectScriptData.content.producerName ?? null,
    lastEditedAt: projectScriptData.content.updatedTime ?? null,
  } : null;

  const projectName = project?.title ?? "项目";
  const episodeTitle = chapter ? `第 ${chapter.chapterOrder} 集` : "分集";

  const basePath = `/project/${projectId}/episode/${episodeId}`;

  const hasScript = !!chapter?.chapterContent;
  const [scriptOpen, setScriptOpen] = useState(false);

  function isStageActive(stageHref: string) {
    return pathname.startsWith(basePath + stageHref);
  }

  const workshopActive = pathname === `${basePath}/workshop`;
  const isEditorPage = pathname.startsWith(`${basePath}/editor`);

  return (
    <div className="flex flex-col h-full">
      {!isEditorPage && (
      <header className="h-14 shrink-0 flex items-center px-4 border-b border-white/[0.06] bg-[#0a0a0a] relative">
        <div className="flex items-center gap-3">
          <Link
            href={`/project/${projectId}/episodes`}
            className="flex items-center gap-2 pr-3 border-r border-white/[0.06]"
          >
            <ArrowLeft size={14} strokeWidth={2} className="text-[#999]" />
            <span className="text-[13px] text-[#999]">{projectName}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[13px] text-[#999] cursor-pointer hover:text-white transition-colors duration-200">
            <span>{episodeTitle}</span>
            <ChevronDown size={14} strokeWidth={1.5} />
          </div>
          {hasScript && (
            <button
              onClick={() => setScriptOpen(true)}
              className="h-7 px-3 rounded-md text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.06] hover:text-white transition-colors duration-200"
            >
              <BookOpen size={14} strokeWidth={1.5} />
              查看剧本
            </button>
          )}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          {stages.map((stage, i) => {
            const active = isStageActive(stage.href);
            return (
              <div key={stage.href} className="flex items-center">
                <Link
                  href={basePath + stage.href}
                  className={`px-2.5 h-7 flex items-center gap-1.5 text-[13px] rounded-md transition-colors duration-200 ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-[#666] hover:text-[#999]"
                  }`}
                >
                  <stage.icon size={14} strokeWidth={1.5} />
                  {stage.label}
                </Link>
                {i < stages.length - 1 && (
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 mx-0.5 text-[#333]"
                  />
                )}
              </div>
            );
          })}
          <div className="w-px h-4 bg-white/[0.06] mx-1.5" />
          <Link
            href={`${basePath}/workshop`}
            className={`px-2.5 h-7 flex items-center gap-1.5 text-[13px] rounded-md transition-colors duration-200 ${
              workshopActive
                ? "bg-white/[0.08] text-white"
                : "text-[#999] hover:text-white"
            }`}
          >
            <Sparkles size={14} strokeWidth={1.5} />
            工坊
          </Link>
        </div>
        <HeaderUserArea />
      </header>
      )}
      <main className={`flex-1 bg-[#0a0a0a] ${isEditorPage ? "overflow-hidden" : "overflow-auto"}`}>{children}</main>
      <ScriptOverlay open={scriptOpen} onClose={() => setScriptOpen(false)} script={script} />
    </div>
  );
}
