"use client";

import { X } from "lucide-react";
import type { SceneInfoDetail } from "@/mocks/types";

const inputCls =
  "w-full bg-[#262626] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0]/50 focus:ring-1 focus:ring-[#00CAE0]/30 transition-colors duration-200";

interface SceneEditModalProps {
  editModal: string | null;
  isInfoModal: boolean;
  infoDraft: SceneInfoDetail;
  setInfoDraft: React.Dispatch<React.SetStateAction<SceneInfoDetail>>;
  stateDraft: { name: string; description: string; episodes: number[] };
  setStateDraft: React.Dispatch<React.SetStateAction<{ name: string; description: string; episodes: number[] }>>;
  onClose: () => void;
  onSave: () => void;
}

function episodeLabels(episodes: number[]) {
  return episodes.map((ep) => `第${ep}集`).join("、");
}

function parseEpisodes(value: string): number[] {
  return value.split(/[,，、\s]+/).map((s) => parseInt(s.replace(/[^\d]/g, ""), 10)).filter((n) => !isNaN(n) && n > 0);
}

export function SceneEditModal({ editModal, isInfoModal, infoDraft, setInfoDraft, stateDraft, setStateDraft, onClose, onSave }: SceneEditModalProps) {
  if (editModal === null) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[480px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-[15px] font-medium">{isInfoModal ? "编辑场景信息" : "编辑状态"}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {isInfoModal ? (
            <>
              <div>
                <label className="block text-[12px] text-[#666] mb-1.5">场景位置</label>
                <textarea value={infoDraft.location} onChange={(e) => setInfoDraft((d) => ({ ...d, location: e.target.value }))} rows={3} className={inputCls + " resize-none leading-[1.7]"} />
              </div>
              <div>
                <label className="block text-[12px] text-[#666] mb-1.5">氛围描述</label>
                <textarea value={infoDraft.mood} onChange={(e) => setInfoDraft((d) => ({ ...d, mood: e.target.value }))} rows={3} className={inputCls + " resize-none leading-[1.7]"} />
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[12px] text-[#666] mb-1.5">状态名称</label>
                  <input type="text" value={stateDraft.name} onChange={(e) => setStateDraft((d) => ({ ...d, name: e.target.value }))} className={inputCls} />
                </div>
                <div className="w-36">
                  <label className="block text-[12px] text-[#666] mb-1.5">出现集数</label>
                  <input type="text" value={episodeLabels(stateDraft.episodes)} onChange={(e) => setStateDraft((d) => ({ ...d, episodes: parseEpisodes(e.target.value) }))} placeholder="如：1, 2, 3" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-[#666] mb-1.5">状态描述</label>
                <textarea value={stateDraft.description} onChange={(e) => setStateDraft((d) => ({ ...d, description: e.target.value }))} rows={3} className={inputCls + " resize-none leading-[1.7]"} />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
          <button onClick={onClose} className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">取消</button>
          <button onClick={onSave} className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200">保存</button>
        </div>
      </div>
    </div>
  );
}
