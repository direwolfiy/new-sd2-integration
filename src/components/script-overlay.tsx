"use client";

import { useState, useEffect } from "react";
import { BookOpen, X, Users } from "lucide-react";
import { getScriptByProject } from "@/mocks/scripts";

type TabKey = "info" | "episodes" | "raw";

const tabs: { key: TabKey; label: string }[] = [
  { key: "info", label: "剧本信息" },
  { key: "episodes", label: "分集内容" },
  { key: "raw", label: "原始文本" },
];

export function ScriptOverlay({
  open,
  onClose,
  projectId,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [activeEpisode, setActiveEpisode] = useState(0);
  const script = getScriptByProject(projectId);
  const hasData = script.metadata !== null;

  useEffect(() => {
    if (open) {
      setActiveTab("info");
      setActiveEpisode(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[calc(100%-48px)] max-w-4xl h-[calc(100%-48px)] rounded-xl border border-white/[0.08] bg-[#1c1c1c] flex flex-col overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00CAE0]/10 flex items-center justify-center">
              <BookOpen size={16} strokeWidth={1.5} className="text-[#00CAE0]" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium">查看剧本</h2>
              {hasData && (
                <p className="text-[12px] text-[#666] mt-0.5">
                  {script.metadata!.genre} · {script.metadata!.episodeCount} 集 · {script.metadata!.totalWordCount.toLocaleString()} 字
                  {script.lastEditedBy && ` · ${script.lastEditedBy} · ${script.lastEditedAt}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 h-7 rounded-full text-[12px] transition-colors duration-200 ${
                activeTab === tab.key
                  ? "bg-white/[0.08] text-white"
                  : "text-[#999] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {!hasData ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[14px] text-[#666]">暂无剧本内容</p>
            </div>
          ) : activeTab === "info" ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#00CAE0]/10 text-[12px] text-[#00CAE0] font-medium">
                    {script.metadata!.genre}
                  </span>
                  <span className="text-[13px] text-[#666]">
                    {script.metadata!.episodeCount} 集 · {script.metadata!.totalWordCount.toLocaleString()} 字
                  </span>
                </div>

                <div>
                  <p className="text-[11px] text-[#666] font-medium mb-1.5">故事概要</p>
                  <p className="text-[14px] text-[#ccc] leading-[1.8]">
                    {script.metadata!.summary}
                  </p>
                </div>

                {script.metadata!.tags.length > 0 && (
                  <div>
                    <p className="text-[11px] text-[#666] font-medium mb-1.5">风格标签</p>
                    <div className="flex flex-wrap gap-1.5">
                      {script.metadata!.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[12px] text-[#999]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {script.episodes && script.episodes.length > 0 && (
                  <div>
                    <p className="text-[11px] text-[#666] font-medium mb-2">分集概览</p>
                    <div className="space-y-2">
                      {script.episodes.map((ep) => (
                        <div
                          key={ep.episodeNumber}
                          className="rounded-lg border border-white/[0.06] bg-[#141414] p-3"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[#555] tabular-nums">
                                {String(ep.episodeNumber).padStart(2, "0")}
                              </span>
                              <span className="text-[13px] font-medium">{ep.title}</span>
                            </div>
                            <span className="text-[11px] text-[#555]">{ep.wordCount} 字</span>
                          </div>
                          <p className="text-[12px] text-[#999] leading-[1.7]">
                            {ep.summary}
                          </p>
                          {ep.characters.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Users size={12} strokeWidth={1.5} className="text-[#555] shrink-0" />
                              <span className="text-[11px] text-[#555]">
                                {ep.characters.join("、")}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "episodes" ? (
            <>
              <nav className="w-44 shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto">
                <p className="text-[11px] text-[#666] font-medium mb-2 px-2">分集目录</p>
                {script.episodes!.map((ep) => (
                  <button
                    key={ep.episodeNumber}
                    onClick={() => setActiveEpisode(ep.episodeNumber - 1)}
                    className={`block w-full text-left px-2 py-1.5 rounded-md text-[13px] truncate transition-colors duration-200 ${
                      activeEpisode === ep.episodeNumber - 1
                        ? "bg-white/[0.08] text-white"
                        : "text-[#999] hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    第{ep.episodeNumber}集：{ep.title}
                  </button>
                ))}
              </nav>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] text-[#555]">
                        第{script.episodes![activeEpisode].episodeNumber}集
                      </span>
                      <span className="text-[12px] text-[#555]">·</span>
                      <span className="text-[12px] text-[#555]">
                        {script.episodes![activeEpisode].wordCount} 字
                      </span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {script.episodes![activeEpisode].title}
                    </h3>
                    <p className="text-[13px] text-[#999] leading-[1.7]">
                      {script.episodes![activeEpisode].summary}
                    </p>
                    {script.episodes![activeEpisode].characters.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Users size={12} strokeWidth={1.5} className="text-[#555] shrink-0" />
                        <span className="text-[12px] text-[#555]">
                          {script.episodes![activeEpisode].characters.join("、")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-white/[0.06] mb-4" />
                  <div className="whitespace-pre-wrap text-[15px] text-[#ccc] leading-[1.8]">
                    {script.episodes![activeEpisode].content}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <p className="text-[11px] text-[#666] mb-3">用户输入的原始剧本文本</p>
                <div className="whitespace-pre-wrap text-[15px] text-[#ccc] leading-[1.8]">
                  {script.rawContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
