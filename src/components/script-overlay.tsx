"use client";

import { useState, useEffect } from "react";
import { BookOpen, X } from "lucide-react";
import { getScriptByProject } from "@/mocks/scripts";

export function ScriptOverlay({
  open,
  onClose,
  projectId,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
}) {
  const [activeSection, setActiveSection] = useState<string>("script-0");
  const script = getScriptByProject(projectId);
  const hasContent = script.content !== null;

  useEffect(() => {
    if (open) setActiveSection("script-0");
  }, [open]);

  if (!open) return null;

  const headings = hasContent
    ? [...script.content!.matchAll(/^第([一二三四五六七八九十\d]+集[：：]?\s*.+)/gm)].map(
        (m) => m[1].trim()
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[calc(100%-48px)] max-w-4xl h-[calc(100%-48px)] rounded-xl border border-white/[0.08] bg-[#1c1c1c] flex flex-col overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00CAE0]/10 flex items-center justify-center">
              <BookOpen size={16} strokeWidth={1.5} className="text-[#00CAE0]" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium">总剧本</h2>
              {hasContent && (
                <p className="text-[12px] text-[#666] mt-0.5">
                  {script.content!.replace(/\s/g, "").length.toLocaleString()} 字
                  {script.lastEditedBy && ` · ${script.lastEditedBy} · ${script.lastEditedAt}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-4 rounded-full bg-white/[0.06] text-[12px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
              替换剧本
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {headings.length > 0 && (
            <nav className="w-44 shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto">
              <p className="text-[11px] text-[#666] font-medium mb-2 px-2">分集目录</p>
              {headings.map((heading, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSection(`script-${i}`)}
                  className={`block w-full text-left px-2 py-1.5 rounded-md text-[13px] truncate transition-colors duration-200 ${
                    activeSection === `script-${i}`
                      ? "bg-white/[0.08] text-white"
                      : "text-[#999] hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {heading}
                </button>
              ))}
            </nav>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            {!hasContent ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-[14px] text-[#666]">暂无剧本内容</p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="whitespace-pre-wrap text-[15px] text-[#ccc] leading-[1.8]">
                  {script.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
