"use client";

import { useState } from "react";
import { X, Upload, Sparkles, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAnalysisStart: () => void;
}

export function ScriptImportOverlay({ open, onClose, onAnalysisStart }: Props) {
  const [text, setText] = useState("");

  if (!open) return null;

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
              <h3 className="text-[15px] font-medium">导入剧本</h3>
              <p className="text-[12px] text-[#666] mt-0.5">
                粘贴或上传剧本内容，AI 将自动分析并拆分
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
        <div className="flex-1 p-5 min-h-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"粘贴剧本内容到这里...\n\n例如：\n第一集：初入秦村\n\n秦羽站在秦村的山坡上...\n\n第二集：先天不足\n\n秦羽独自坐在后山的溪边..."}
            className="w-full h-72 bg-[#262626] border border-white/[0.08] rounded-lg px-4 py-3 text-[13px] text-white placeholder:text-white/20 leading-[1.7] resize-none outline-none focus:border-[#00CAE0]/50 focus:ring-1 focus:ring-[#00CAE0]/30 transition-colors duration-200"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <button
            className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200 opacity-50 cursor-not-allowed"
            disabled
            title="TODO: [mock] 文件上传功能待实现"
          >
            <Upload size={14} strokeWidth={1.5} />
            上传文件
          </button>
          <button
            disabled={!text.trim()}
            onClick={() => {
              onAnalysisStart();
            }}
            className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Sparkles size={14} strokeWidth={2} />
            开始分析
          </button>
        </div>
      </div>
    </div>
  );
}
