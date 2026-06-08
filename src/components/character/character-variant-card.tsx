"use client";

import { useRef, useEffect } from "react";
import { Star, User, Pencil, MoreHorizontal, Trash2 } from "lucide-react";
import type { CharacterVariant, CharacterImage } from "@/mocks/types";

interface CharacterVariantCardProps {
  variant: CharacterVariant;
  editingNameId: string | null;
  nameDraft: string;
  moreMenuId: string | null;
  editingImgId: string | null;
  imgNameDraft: string;
  onStartEditName: (v: CharacterVariant) => void;
  onSaveName: () => void;
  setNameDraft: (s: string) => void;
  setEditingNameId: (id: string | null) => void;
  onOpenVariantModal: (v: CharacterVariant) => void;
  onOpenGenerate: (v: CharacterVariant) => void;
  onSetMoreMenuId: (id: string | null) => void;
  onDeleteVariant: (id: string) => void;
  onStartEditImageName: (variantId: string, imgId: string, name: string) => void;
  onSaveImageName: () => void;
  setImgNameDraft: (s: string) => void;
  setEditingImgId: (id: string | null) => void;
  onSetPrimary: (variantId: string, imageId: string) => void;
}

export function CharacterVariantCard({
  variant,
  editingNameId,
  nameDraft,
  moreMenuId,
  editingImgId,
  imgNameDraft,
  onStartEditName,
  onSaveName,
  setNameDraft,
  setEditingNameId,
  onOpenVariantModal,
  onOpenGenerate,
  onSetMoreMenuId,
  onDeleteVariant,
  onStartEditImageName,
  onSaveImageName,
  setImgNameDraft,
  setEditingImgId,
  onSetPrimary,
}: CharacterVariantCardProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const imgNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNameId === variant.id && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingNameId, variant.id]);

  useEffect(() => {
    const imgKey = editingImgId?.split("::")[0];
    if (imgKey === variant.id && imgNameInputRef.current) {
      imgNameInputRef.current.focus();
      imgNameInputRef.current.select();
    }
  }, [editingImgId, variant.id]);

  return (
    <div className="rounded-xl border border-white/[0.12] bg-[#181818] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {editingNameId === variant.id ? (
            <input
              ref={nameInputRef}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={onSaveName}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveName(); if (e.key === "Escape") setEditingNameId(null); }}
              className="h-7 px-2 rounded-md bg-[#2b2b2b] border border-white/[0.1] text-[14px] text-white font-medium outline-none focus:border-[#00CAE0]/50 w-32"
            />
          ) : (
            <button onClick={() => onStartEditName(variant)} className="text-[14px] font-medium text-white hover:text-white/80 transition-colors duration-200">
              {variant.name}
            </button>
          )}
          <span className="text-[12px] text-[#a3a3a3]">{variant.images.length} 张</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => onOpenVariantModal(variant)} className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
            <Pencil size={11} strokeWidth={1.5} />编辑信息
          </button>
          <button onClick={() => onOpenGenerate(variant)} className="h-7 px-2.5 rounded-full bg-[rgba(0,202,224,0.08)] text-[12px] text-[rgba(0,202,224,0.8)] border border-[rgba(0,202,224,0.15)] flex items-center gap-1 hover:bg-[rgba(0,202,224,0.12)] transition-colors duration-200">
            修改形象图
          </button>
          <div className="relative">
            <button onClick={() => onSetMoreMenuId(moreMenuId === variant.id ? null : variant.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/[0.10] transition-colors duration-200">
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
            {moreMenuId === variant.id && (
              <div className="absolute right-0 top-full mt-1 w-32 py-1 rounded-lg border border-white/[0.14] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10">
                <button onClick={() => onDeleteVariant(variant.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#ef4444] hover:bg-white/[0.10] transition-colors duration-200">
                  <Trash2 size={14} strokeWidth={1.5} />删除形象
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {variant.images.map((img) => {
          const imgKey = `${variant.id}::${img.id}`;
          const isEditingImg = editingImgId === imgKey;
          return (
            <div key={img.id} className="group relative w-[140px] shrink-0 rounded-lg overflow-hidden border border-white/[0.12] bg-[#0a0a0a] transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
              <div onClick={() => onOpenGenerate(variant)} className="relative aspect-[3/4] bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center cursor-pointer">
                <User size={32} strokeWidth={1} className="text-white/[0.06]" />
                {img.isPrimary ? (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00CAE0]/20 flex items-center justify-center">
                    <Star size={10} strokeWidth={1.5} className="text-[#00CAE0] fill-[#00CAE0]" />
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); onSetPrimary(variant.id, img.id); }} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/[0.10] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/[0.12]">
                    <Star size={10} strokeWidth={1.5} className="text-[#a3a3a3] group-hover:text-[#b8b8b8]" />
                  </button>
                )}
              </div>
              <div className="px-2 py-1.5 border-t border-white/[0.10]">
                {isEditingImg ? (
                  <input ref={imgNameInputRef} value={imgNameDraft} onChange={(e) => setImgNameDraft(e.target.value)} onBlur={onSaveImageName} onKeyDown={(e) => { if (e.key === "Enter") onSaveImageName(); if (e.key === "Escape") setEditingImgId(null); }} className="w-full bg-transparent text-[11px] text-white outline-none" />
                ) : (
                  <button onClick={() => onStartEditImageName(variant.id, img.id, img.name)} className="w-full text-left text-[11px] text-[#b8b8b8] hover:text-white transition-colors duration-200 truncate">
                    {img.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
