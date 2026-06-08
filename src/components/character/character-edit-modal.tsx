"use client";

import { X } from "lucide-react";
import type { CharacterInfoDetail, CharacterVariant } from "@/mocks/types";

const inputCls =
  "w-full bg-[#2b2b2b] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0]/50 focus:ring-1 focus:ring-[#00CAE0]/30 transition-colors duration-200";

interface CharacterEditModalProps {
  editModal: string | null;
  isInfoModal: boolean;
  infoDraft: CharacterInfoDetail;
  setInfoDraft: React.Dispatch<React.SetStateAction<CharacterInfoDetail>>;
  variantDraft: { name: string; description: string; episodes: number[] };
  setVariantDraft: React.Dispatch<React.SetStateAction<{ name: string; description: string; episodes: number[] }>>;
  onClose: () => void;
  onSave: () => void;
}

function episodeLabels(episodes: number[]) {
  return episodes.map((ep) => `第${ep}集`).join("、");
}

function parseEpisodes(value: string): number[] {
  return value
    .split(/[,，、\s]+/)
    .map((s) => parseInt(s.replace(/[^\d]/g, ""), 10))
    .filter((n) => !isNaN(n) && n > 0);
}

export function CharacterEditModal({
  editModal,
  isInfoModal,
  infoDraft,
  setInfoDraft,
  variantDraft,
  setVariantDraft,
  onClose,
  onSave,
}: CharacterEditModalProps) {
  if (editModal === null) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[480px] rounded-xl border border-white/[0.14] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.12]">
          <h3 className="text-[15px] font-medium">{isInfoModal ? "编辑角色信息" : "编辑形象"}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/[0.10] transition-colors duration-200">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {isInfoModal ? (
            <>
              <div>
                <label className="block text-[12px] text-[#a3a3a3] mb-1.5">角色小传</label>
                <textarea value={infoDraft.bio} onChange={(e) => setInfoDraft((d) => ({ ...d, bio: e.target.value }))} rows={4} className={inputCls + " resize-none leading-[1.7]"} />
              </div>
              <div>
                <label className="block text-[12px] text-[#a3a3a3] mb-1.5">音色描述</label>
                <input type="text" value={infoDraft.voiceDescription} onChange={(e) => setInfoDraft((d) => ({ ...d, voiceDescription: e.target.value }))} className={inputCls} />
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[12px] text-[#a3a3a3] mb-1.5">形象名称</label>
                  <input type="text" value={variantDraft.name} onChange={(e) => setVariantDraft((d) => ({ ...d, name: e.target.value }))} className={inputCls} />
                </div>
                <div className="w-36">
                  <label className="block text-[12px] text-[#a3a3a3] mb-1.5">出现集数</label>
                  <input type="text" value={episodeLabels(variantDraft.episodes)} onChange={(e) => setVariantDraft((d) => ({ ...d, episodes: parseEpisodes(e.target.value) }))} placeholder="如：1, 2, 3" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-[#a3a3a3] mb-1.5">形象描述</label>
                <textarea value={variantDraft.description} onChange={(e) => setVariantDraft((d) => ({ ...d, description: e.target.value }))} rows={3} className={inputCls + " resize-none leading-[1.7]"} />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.12]">
          <button onClick={onClose} className="h-9 px-4 rounded-full bg-white/[0.10] text-[13px] text-[#b8b8b8] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">取消</button>
          <button onClick={onSave} className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200">保存</button>
        </div>
      </div>
    </div>
  );
}
