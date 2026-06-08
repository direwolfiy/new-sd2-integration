"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutGrid,
  Film,
  Download,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { projectsApi, episodesApi, scriptsApi, useApi } from "@/lib/api";
import {
  adaptScriptMetadata,
  adaptScriptEpisode,
  getChapterContent,
} from "@/lib/adapters";
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
  const router = useRouter();
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;
  const [episodeMenuOpen, setEpisodeMenuOpen] = useState(false);
  const episodeMenuRef = useRef<HTMLDivElement | null>(null);

  const { data: project } = useApi(
    () => projectsApi.fetchProject(projectId),
    [projectId],
  );
  const { data: chapter } = useApi(
    () => episodesApi.fetchChapter(episodeId),
    [episodeId],
  );
  const { data: projectScriptData } = useApi(
    () => scriptsApi.fetchProjectScript(projectId),
    [projectId],
  );

  const currentChapterContent = getChapterContent(chapter).trim();
  const scriptChapters =
    projectScriptData?.chapters.map((item) =>
      String(item.id) === episodeId && chapter ? { ...item, ...chapter } : item,
    ) ?? [];
  const rawScript =
    projectScriptData?.content.script?.trim() ||
    scriptChapters
      .map((item) => {
        const title = item.chapterTitle || `第 ${item.chapterOrder} 集`;
        return `${title}\n\n${getChapterContent(item)}`;
      })
      .join("\n\n");
  const script: ScriptData | null =
    projectScriptData && (rawScript || scriptChapters.length > 0)
      ? {
          projectId,
          rawContent: rawScript || null,
          metadata: {
            ...adaptScriptMetadata(projectScriptData.content, scriptChapters),
            totalWordCount:
              rawScript.length ||
              scriptChapters.reduce(
                (total, item) => total + getChapterContent(item).length,
                0,
              ),
            episodeCount: scriptChapters.length,
          },
          episodes: scriptChapters.map(adaptScriptEpisode),
          lastEditedBy: projectScriptData.content.producerName ?? null,
          lastEditedAt: projectScriptData.content.updatedTime ?? null,
        }
      : null;

  const projectName = project?.title ?? "项目";
  const episodeTitle = chapter ? `第 ${chapter.chapterOrder} 集` : "分集";
  const episodeOptions = useMemo(
    () =>
      [...(projectScriptData?.chapters ?? [])].sort(
        (a, b) => (a.chapterOrder ?? 0) - (b.chapterOrder ?? 0),
      ),
    [projectScriptData?.chapters],
  );

  const basePath = `/project/${projectId}/episode/${episodeId}`;

  const hasScript = !!currentChapterContent;
  const [scriptOpen, setScriptOpen] = useState(false);

  function isStageActive(stageHref: string) {
    return pathname.startsWith(basePath + stageHref);
  }

  function getCurrentModuleSuffix() {
    const marker = `/project/${projectId}/episode/${episodeId}`;
    return pathname.startsWith(marker) ? pathname.slice(marker.length) : "";
  }

  function handleEpisodeSwitch(targetId: string) {
    if (targetId === episodeId) {
      setEpisodeMenuOpen(false);
      return;
    }

    router.push(
      `/project/${projectId}/episode/${targetId}${getCurrentModuleSuffix()}`,
    );
    setEpisodeMenuOpen(false);
  }

  useEffect(() => {
    if (!episodeMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!episodeMenuRef.current?.contains(event.target as Node)) {
        setEpisodeMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEpisodeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [episodeMenuOpen]);

  const workshopActive = pathname === `${basePath}/workshop`;
  const isEditorPage = pathname.startsWith(`${basePath}/editor`);

  return (
    <div className="flex flex-col h-full">
      {!isEditorPage && (
        <header className="h-14 shrink-0 flex items-center px-4 border-b border-white/[0.12] bg-[#0a0a0a] relative">
          <div className="flex items-center gap-3">
            <Link
              href={`/project/${projectId}/episodes`}
              className="flex items-center gap-2 pr-3 border-r border-white/[0.12]"
            >
              <ArrowLeft size={14} strokeWidth={2} className="text-[#b8b8b8]" />
              <span className="text-[13px] text-[#b8b8b8]">{projectName}</span>
            </Link>
            <div ref={episodeMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setEpisodeMenuOpen((open) => !open)}
                className={`h-7 px-2 rounded-md flex items-center gap-1.5 text-[13px] transition-colors duration-200 ${
                  episodeMenuOpen
                    ? "bg-white/[0.10] text-white"
                    : "text-[#b8b8b8] hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <span>{episodeTitle}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className={`transition-transform duration-200 ${
                    episodeMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {episodeMenuOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-md border border-white/[0.14] bg-[#1c1c1c] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                  <div className="max-h-80 overflow-y-auto py-1">
                    {episodeOptions.length > 0 ? (
                      episodeOptions.map((item) => {
                        const targetId = String(item.id);
                        const active = targetId === episodeId;
                        const chapterLabel = `第 ${item.chapterOrder} 集`;
                        const title = item.chapterTitle?.trim();

                        return (
                          <button
                            key={targetId}
                            type="button"
                            onClick={() => handleEpisodeSwitch(targetId)}
                            className={`w-full px-3 py-2 text-left transition-colors duration-150 ${
                              active
                                ? "bg-white/[0.10] text-white"
                                : "text-[#b8b8b8] hover:bg-white/[0.08] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="shrink-0 text-[13px] font-medium">
                                {chapterLabel}
                              </span>
                              {active && (
                                <span className="text-[11px] text-[#8f8f8f]">
                                  当前
                                </span>
                              )}
                            </div>
                            {title && title !== chapterLabel && (
                              <div className="mt-0.5 truncate text-[12px] text-[#8f8f8f]">
                                {title}
                              </div>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-[12px] text-[#8f8f8f]">
                        暂无分集
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {hasScript && (
              <button
                onClick={() => setScriptOpen(true)}
                className="h-7 px-3 rounded-md text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.10] hover:text-white transition-colors duration-200"
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
                        : "text-[#a3a3a3] hover:text-[#b8b8b8]"
                    }`}
                  >
                    <stage.icon size={14} strokeWidth={1.5} />
                    {stage.label}
                  </Link>
                  {i < stages.length - 1 && (
                    <ChevronRight
                      size={14}
                      strokeWidth={2}
                      className="shrink-0 mx-0.5 text-[#777]"
                    />
                  )}
                </div>
              );
            })}
            <div className="w-px h-4 bg-white/[0.10] mx-1.5" />
            <Link
              href={`${basePath}/workshop`}
              className={`px-2.5 h-7 flex items-center gap-1.5 text-[13px] rounded-md transition-colors duration-200 ${
                workshopActive
                  ? "bg-white/[0.08] text-white"
                  : "text-[#b8b8b8] hover:text-white"
              }`}
            >
              <Sparkles size={14} strokeWidth={1.5} />
              工坊
            </Link>
          </div>
          <HeaderUserArea />
        </header>
      )}
      <main
        className={`flex-1 bg-[#0a0a0a] ${isEditorPage ? "overflow-hidden" : "overflow-auto"}`}
      >
        {children}
      </main>
      <ScriptOverlay
        open={scriptOpen}
        onClose={() => setScriptOpen(false)}
        script={script}
        defaultTab="episodes"
        initialEpisodeNumber={chapter?.chapterOrder}
      />
    </div>
  );
}
