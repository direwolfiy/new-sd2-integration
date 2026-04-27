"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check, X } from "lucide-react";

export interface RecognizedElement {
  type: "character" | "scene" | "prop" | "audio";
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: RecognizedElement[]) => void;
  results: RecognizedElement[];
}

const typeLabels: Record<string, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  audio: "音效",
};

const typeOrder = ["character", "scene", "prop", "audio"] as const;

export function RecognitionOverlay({ open, onClose, onConfirm, results }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(results.map((r) => r.name)));

  useEffect(() => {
    if (!open) {
      setSelected(new Set(results.map((r) => r.name)));
    }
  }, [open, results]);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleAll(type: string) {
    const names = results.filter((r) => r.type === type).map((r) => r.name);
    const allSelected = names.every((n) => selected.has(n));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const n of names) {
        if (allSelected) next.delete(n);
        else next.add(n);
      }
      return next;
    });
  }

  if (!open) return null;

  const selectedCount = results.filter((r) => selected.has(r.name)).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[540px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00CAE0]/10 flex items-center justify-center">
              <Sparkles size={16} strokeWidth={1.5} className="text-[#00CAE0]" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium">提取结果</h3>
              <p className="text-[12px] text-[#666] mt-0.5">
                共提取 {results.length} 个元素，已选 {selectedCount} 项
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
        <div className="p-5 max-h-[400px] overflow-auto">
            {typeOrder.map((type) => {
              const items = results.filter((r) => r.type === type);
              if (items.length === 0) return null;
              const allSelected = items.every((r) => selected.has(r.name));
              return (
                <div key={type} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] text-[#666] font-medium">
                      {typeLabels[type]}（{items.length}）
                    </p>
                    <button
                      onClick={() => toggleAll(type)}
                      className="text-[11px] text-[#666] hover:text-[#999] transition-colors duration-200"
                    >
                      {allSelected ? "取消全选" : "全选"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isChecked = selected.has(item.name);
                      return (
                        <button
                          key={item.name}
                          onClick={() => toggle(item.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-200 text-left"
                        >
                          <div
                            className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 transition-colors duration-200 ${
                              isChecked
                                ? "bg-[#00CAE0] border-[#00CAE0]"
                                : "border-white/[0.15] hover:border-white/[0.3]"
                            }`}
                          >
                            {isChecked && <Check size={10} strokeWidth={2.5} className="text-black" />}
                          </div>
                          <span className={`text-[13px] transition-colors duration-200 ${isChecked ? "text-[#ccc]" : "text-[#666]"}`}>
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
          >
            跳过
          </button>
          <button
            onClick={() => {
              onConfirm(results.filter((r) => selected.has(r.name)));
            }}
            disabled={selectedCount === 0}
            className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            添加 {selectedCount} 项到元素库
          </button>
        </div>
      </div>
    </div>
  );
}
