"use client";

import { X } from "lucide-react";
import type { ElementType } from "@/mocks/types";

const typeLabels: Record<string, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  audio: "音效",
};

interface CreateElementModalProps {
  open: boolean;
  activeTab: ElementType;
  name: string;
  setName: (s: string) => void;
  creating?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function CreateElementModal({ open, activeTab, name, setName, creating = false, onClose, onConfirm }: CreateElementModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[420px] rounded-xl border border-white/[0.14] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.12]">
          <h3 className="text-[15px] font-medium">添加{typeLabels[activeTab]}</h3>
          <button onClick={onClose} disabled={creating} className="w-7 h-7 rounded-full flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/[0.10] transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-5 py-4">
          <label className="block text-[12px] text-[#a3a3a3] mb-1.5">名称</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder={`输入${typeLabels[activeTab]}名称`} autoFocus
            disabled={creating}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim() && !creating) onConfirm(); }}
            className="w-full bg-[#2b2b2b] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0]/50 focus:ring-1 focus:ring-[#00CAE0]/30 transition-colors duration-200"
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.12]">
          <button onClick={onClose} disabled={creating} className="h-9 px-4 rounded-full bg-white/[0.10] text-[13px] text-[#b8b8b8] hover:bg-white/[0.1] hover:text-white transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none">取消</button>
          <button onClick={onConfirm} disabled={!name.trim() || creating} className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none">
            {creating ? "创建中..." : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}
