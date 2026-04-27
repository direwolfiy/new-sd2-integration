"use client";

import { X, Sparkles, AlertTriangle } from "lucide-react";
import { getScriptByProject } from "@/mocks/scripts";
import { ScriptSummary } from "@/components/script-summary";

interface Props {
  open: boolean;
  onClose: () => void;
  onStartExtraction: () => void;
  projectId: string;
  warning?: string;
}

export function ScriptAnalysisResultOverlay({ open, onClose, onStartExtraction, projectId, warning }: Props) {
  if (!open) return null;

  const script = getScriptByProject(projectId);
  const metadata = script.metadata;
  const episodes = script.episodes;

  if (!metadata || !episodes) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[540px] max-h-[85vh] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00CAE0]/10 flex items-center justify-center">
              <Sparkles size={16} strokeWidth={1.5} className="text-[#00CAE0]" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium">剧本分析完成</h3>
              <p className="text-[12px] text-[#666] mt-0.5">
                确认分析结果后可开始提取元素
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {warning && (
            <div className="flex items-start gap-2.5 mb-4 p-3 rounded-lg bg-red-500/[0.06] border border-red-500/10">
              <AlertTriangle size={14} strokeWidth={1.5} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-300/80 leading-[1.7]">{warning}</p>
            </div>
          )}
          <ScriptSummary metadata={metadata} episodes={episodes} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
          >
            稍后再说
          </button>
          <button
            onClick={onStartExtraction}
            className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
          >
            <Sparkles size={14} strokeWidth={2} />
            开始提取元素
          </button>
        </div>
      </div>
    </div>
  );
}
