"use client";

import { Pencil, Trash2, RotateCcw, Download, Film, Image } from "lucide-react";
import type { GenTask, TaskStatus } from "./types";

const statusConfig: Record<TaskStatus, { label: string; style: string }> = {
  PENDING: { label: "等待中", style: "bg-white/[0.06] text-[#999]" },
  PROCESSING: { label: "处理中", style: "bg-[rgba(0,202,224,0.08)] text-[#00CAE0]" },
  COMPLETED: { label: "已完成", style: "bg-white/[0.08] text-white/60" },
  FAILED: { label: "失败", style: "bg-[#ef4444]/10 text-[#ef4444]" },
};

export function TaskCard({ task }: { task: GenTask }) {
  const cfg = statusConfig[task.status];
  return (
    <div className="mb-6">
      <div className="rounded-xl border border-white/[0.06] bg-[#141414] overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-[#ccc] leading-[1.7]">{task.prompt}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              <span className="px-2 py-0.5 rounded-full bg-[rgba(0,202,224,0.08)] text-[#00CAE0] text-[11px] font-medium">
                {task.model}
              </span>
              {task.params.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#999] text-[11px]">
                  {p}
                </span>
              ))}
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.style}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          {task.status === "PROCESSING" ? (
            <div className="flex gap-2">
              <div className="w-40 h-28 rounded-lg border border-white/[0.06] bg-[#262626] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-5 h-5 mx-auto border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin mb-2" />
                  <span className="text-[12px] text-[#00CAE0]">生成中...</span>
                </div>
              </div>
            </div>
          ) : task.status === "FAILED" ? (
            <div className="flex gap-2">
              <div className="w-40 h-28 rounded-lg border border-[#ef4444]/20 bg-[#262626] flex items-center justify-center">
                <span className="text-[12px] text-[#ef4444]">生成失败</span>
              </div>
            </div>
          ) : task.resultCount > 0 ? (
            <div className="flex gap-2">
              {Array.from({ length: task.resultCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-40 h-28 rounded-lg border border-white/[0.06] bg-[#262626] flex items-center justify-center group relative cursor-pointer hover:border-white/[0.12] transition-colors duration-200"
                >
                  <span className="text-[11px] text-[#666]">
                    {task.type === "VIDEO" ? "视频" : "图片"} {i + 1}
                  </span>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200">
                      <Download size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 mt-1.5 ml-1">
        {task.status === "FAILED" && (
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
            <RotateCcw size={14} strokeWidth={1.5} />
          </button>
        )}
        <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
          <Pencil size={14} strokeWidth={1.5} />
        </button>
        <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
