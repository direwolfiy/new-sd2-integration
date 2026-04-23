"use client";

import { Sparkles, Check, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

// TODO: [mock] replace with real recognition flow
const mockResults = [
  { type: "character", name: "秦羽", status: "done" as const },
  { type: "character", name: "姜立", status: "done" as const },
  { type: "character", name: "侯费", status: "done" as const },
  { type: "character", name: "黑羽", status: "done" as const },
  { type: "scene", name: "秦村黄昏", status: "done" as const },
  { type: "scene", name: "九剑仙府外景", status: "done" as const },
  { type: "scene", name: "潜龙大陆山顶", status: "done" as const },
  { type: "prop", name: "流星泪", status: "done" as const },
  { type: "prop", name: "黑炎君之戒", status: "done" as const },
];

const typeLabels: Record<string, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  audio: "音效",
};

export function RecognitionOverlay({ open, onClose }: Props) {
  if (!open) return null;

  // TODO: [mock] show progress state then results
  const phase: string = "result";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[440px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00CAE0]/10 flex items-center justify-center">
              <Sparkles size={16} strokeWidth={1.5} className="text-[#00CAE0]" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium">
                {phase === "progress" ? "AI 正在识别元素..." : "识别完成"}
              </h3>
              <p className="text-[12px] text-[#666] mt-0.5">
                {phase === "progress"
                  ? "正在分析剧本内容，提取角色、场景、道具等"
                  : `共识别出 ${mockResults.length} 个元素`}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        {phase === "progress" ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <Loader2 size={32} strokeWidth={1.5} className="text-[#00CAE0] animate-spin mb-4" />
            <p className="text-[13px] text-[#999]">正在分析剧本内容...</p>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-[#00CAE0] rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        ) : (
          <div className="p-5 max-h-[400px] overflow-auto">
            {(["character", "scene", "prop", "audio"] as const).map((type) => {
              const items = mockResults.filter((r) => r.type === type);
              if (items.length === 0) return null;
              return (
                <div key={type} className="mb-4 last:mb-0">
                  <p className="text-[11px] text-[#666] font-medium mb-1.5">
                    {typeLabels[type]}（{items.length}）
                  </p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03]"
                      >
                        <Check
                          size={14}
                          strokeWidth={2}
                          className="text-[#00CAE0] shrink-0"
                        />
                        <span className="text-[13px] text-[#ccc]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
          {phase === "progress" ? (
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
            >
              取消
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
              >
                跳过
              </button>
              <button
                onClick={onClose}
                className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
              >
                添加到元素库
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
