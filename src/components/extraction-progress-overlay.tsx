"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Check, Circle, Sparkles } from "lucide-react";

export interface ExtractionStep {
  key: string;
  label: string;
  status: "done" | "active" | "pending";
  detail?: string;
}

interface Props {
  open: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

const initialSteps: ExtractionStep[] = [
  { key: "parse", label: "解析剧本内容", status: "pending" },
  { key: "character", label: "识别角色", status: "pending" },
  { key: "scene", label: "识别场景", status: "pending" },
  { key: "prop", label: "识别道具", status: "pending" },
  { key: "audio", label: "识别音效", status: "pending" },
  { key: "organize", label: "整理提取结果", status: "pending" },
];

const stepMessages: Record<string, string> = {
  parse: "正在解析剧本结构与段落...",
  character: "正在分析角色对话与描述...",
  scene: "正在提取场景描写...",
  prop: "正在识别道具与物品...",
  audio: "正在分析音效需求...",
  organize: "正在整理并去重...",
};

// TODO: [mock] replace with real extraction pipeline
function useSimulatedProgress(onComplete: () => void, open: boolean) {
  const [steps, setSteps] = useState<ExtractionStep[]>(initialSteps);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const reset = useCallback(() => {
    setSteps(initialSteps.map((s) => ({ ...s, status: "pending" as const, detail: undefined })));
    setProgress(0);
    setMessage("");
  }, []);

  useEffect(() => {
    if (!open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    reset();
    const stepOrder = initialSteps.map((s) => s.key);
    let currentIdx = 0;
    let currentProgress = 0;

    function advance() {
      if (currentIdx >= stepOrder.length) {
        setSteps((prev) =>
          prev.map((s) => ({ ...s, status: "done" as const }))
        );
        setProgress(100);
        setMessage("提取完成");
        timerRef.current = setTimeout(() => {
          onCompleteRef.current();
        }, 1500);
        return;
      }

      const key = stepOrder[currentIdx];
      // TODO: [mock] replace with real extraction results per project
      const details: Record<string, string> = {
        parse: "已识别 4 集内容",
        character: "4 个角色",
        scene: "3 个场景",
        prop: "2 个道具",
        audio: "2 个音效",
        organize: "共 11 个元素",
      };

      setSteps((prev) =>
        prev.map((s) => {
          if (s.key === key) return { ...s, status: "active" as const };
          return s;
        })
      );
      setMessage(stepMessages[key]);

      const stepDuration = 800 + Math.random() * 1200;
      const startProg = currentIdx * (100 / stepOrder.length);
      const endProg = (currentIdx + 1) * (100 / stepOrder.length);
      const progSteps = 10;
      let progIdx = 0;

      function tickProgress() {
        progIdx++;
        currentProgress = startProg + ((endProg - startProg) * progIdx) / progSteps;
        setProgress(Math.round(currentProgress));

        if (progIdx < progSteps) {
          timerRef.current = setTimeout(tickProgress, stepDuration / progSteps);
        } else {
          setSteps((prev) =>
            prev.map((s) => {
              if (s.key === key)
                return { ...s, status: "done" as const, detail: details[key] };
              return s;
            })
          );
          currentIdx++;
          timerRef.current = setTimeout(advance, 200);
        }
      }

      timerRef.current = setTimeout(tickProgress, 100);
    }

    timerRef.current = setTimeout(advance, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, reset]);

  const estimatedTimeLeft = progress >= 100 ? 0 : Math.max(1, Math.round((100 - progress) / 15));

  return { steps, progress, message, estimatedTimeLeft };
}

export function ExtractionProgressOverlay({ open, onCancel, onComplete }: Props) {
  const { steps, progress, message, estimatedTimeLeft } = useSimulatedProgress(onComplete, open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[480px] rounded-xl border border-white/[0.14] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.12]">
          <div className="w-8 h-8 rounded-lg bg-[#00CAE0]/10 flex items-center justify-center">
            {progress >= 100 ? (
              <Check size={16} strokeWidth={2} className="text-[#00CAE0]" />
            ) : (
              <Loader2 size={16} strokeWidth={2} className="text-[#00CAE0] animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-medium">
              {progress >= 100 ? "提取完成" : "正在提取元素"}
            </h3>
            <p className="text-[12px] text-[#a3a3a3] mt-0.5 truncate">
              {message || "准备中..."}
            </p>
          </div>
          <span className="text-[12px] text-[#a3a3a3] shrink-0">
            {progress >= 100 ? "已完成" : `预计剩余 ${estimatedTimeLeft}s`}
          </span>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-2.5">
          {steps.map((step) => (
            <div key={step.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {step.status === "done" ? (
                  <Check size={14} strokeWidth={2} className="text-[#00CAE0] shrink-0" />
                ) : step.status === "active" ? (
                  <Circle size={10} strokeWidth={0} className="shrink-0 fill-[#00CAE0] text-[#00CAE0]" />
                ) : (
                  <Circle size={10} strokeWidth={0} className="shrink-0 fill-[#333] text-[#777]" />
                )}
                <span
                  className={`text-[13px] ${
                    step.status === "done"
                      ? "text-white"
                      : step.status === "active"
                      ? "text-white"
                      : "text-[#b8b8b8]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              <span className="text-[12px] text-[#b8b8b8]">
                {step.status === "done" && step.detail ? step.detail : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-2">
          <div className="h-1.5 bg-white/[0.10] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00CAE0] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-[#b8b8b8]">{progress}%</span>
            <span className="text-[11px] text-[#b8b8b8]">11 个元素</span>{/* TODO: [mock] */}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-white/[0.12]">
          {progress >= 100 ? (
            <span className="text-[12px] text-[#a3a3a3]">正在跳转...</span>
          ) : (
            <button
              onClick={onCancel}
              className="h-9 px-4 rounded-full bg-white/[0.10] text-[13px] text-[#b8b8b8] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
