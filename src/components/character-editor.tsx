"use client";

import { useState, useEffect } from "react";
import { X, User, Plus, Pencil } from "lucide-react";
import { getElementsByType, characterDetails, characterInfo } from "@/mocks/elements";
import { CharacterVariant, CharacterInfoDetail } from "@/mocks/types";
import { ImageGenerateOverlay } from "./image-generate-overlay";
import { CharacterEditModal } from "./character/character-edit-modal";
import { CharacterVariantCard } from "./character/character-variant-card";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  characterId: string;
}

export function CharacterEditor({ open, onClose, projectId, characterId }: Props) {
  const characters = getElementsByType(projectId, "character");
  const [selectedId, setSelectedId] = useState(characterId);
  const [localInfo, setLocalInfo] = useState<CharacterInfoDetail>({ bio: "", voiceDescription: "" });
  const [localVariants, setLocalVariants] = useState<CharacterVariant[]>([]);
  const [editModal, setEditModal] = useState<string | null>(null);
  const [infoDraft, setInfoDraft] = useState<CharacterInfoDetail>({ bio: "", voiceDescription: "" });
  const [variantDraft, setVariantDraft] = useState({ name: "", description: "", episodes: [] as number[] });
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [editingImgId, setEditingImgId] = useState<string | null>(null);
  const [imgNameDraft, setImgNameDraft] = useState("");
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateVariantName, setGenerateVariantName] = useState("");

  useEffect(() => { setSelectedId(characterId); }, [characterId]);

  useEffect(() => {
    setLocalInfo(characterInfo[selectedId] ?? { bio: "", voiceDescription: "" });
    setLocalVariants(characterDetails[selectedId] ?? []);
    setEditModal(null);
    setMoreMenuId(null);
    setEditingNameId(null);
    setEditingImgId(null);
  }, [selectedId]);

  const selected = characters.find((c) => c.id === selectedId);
  if (!open || !selected) return null;

  function openInfoModal() { setInfoDraft({ ...localInfo }); setEditModal("info"); }
  function openVariantModal(variant: CharacterVariant) {
    setVariantDraft({ name: variant.name, description: variant.description, episodes: [...variant.episodes] });
    setEditModal(variant.id);
    setMoreMenuId(null);
  }
  function saveModal() {
    if (editModal === "info") setLocalInfo({ ...infoDraft });
    else setLocalVariants((prev) => prev.map((v) => v.id === editModal ? { ...v, ...variantDraft } : v));
    setEditModal(null);
  }
  function startEditName(variant: CharacterVariant) { setNameDraft(variant.name); setEditingNameId(variant.id); setMoreMenuId(null); }
  function saveName() {
    if (editingNameId && nameDraft.trim()) setLocalVariants((prev) => prev.map((v) => v.id === editingNameId ? { ...v, name: nameDraft.trim() } : v));
    setEditingNameId(null);
  }
  function startEditImageName(variantId: string, imgId: string, name: string) { setImgNameDraft(name); setEditingImgId(`${variantId}::${imgId}`); }
  function saveImageName() {
    if (!editingImgId || !imgNameDraft.trim()) { setEditingImgId(null); return; }
    const [variantId, imgId] = editingImgId.split("::");
    setLocalVariants((prev) => prev.map((v) => v.id !== variantId ? v : { ...v, images: v.images.map((img) => img.id === imgId ? { ...img, name: imgNameDraft.trim() } : img) }));
    setEditingImgId(null);
  }
  function deleteVariant(id: string) { setLocalVariants((prev) => prev.filter((v) => v.id !== id)); setMoreMenuId(null); }
  function setPrimary(variantId: string, imageId: string) {
    setLocalVariants((prev) => prev.map((v) => v.id !== variantId ? v : { ...v, images: v.images.map((img) => ({ ...img, isPrimary: img.id === imageId })) }));
  }
  function openGenerate(variant: CharacterVariant) { setGenerateVariantName(variant.name); setGenerateOpen(true); setMoreMenuId(null); }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/[0.06]">
        <span className="text-[15px] font-medium">角色设计</span>
        <button onClick={onClose} className="h-8 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
          关闭 <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <nav className="w-[112px] shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {characters.map((char) => (
              <button key={char.id} onClick={() => setSelectedId(char.id)} className={`shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${selectedId === char.id ? "ring-2 ring-white/20 bg-white/[0.04]" : "opacity-50 hover:opacity-80"}`}>
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center"><User size={20} strokeWidth={1} className="text-white/[0.06]" /></div>
                <p className="text-[11px] text-center py-1.5 truncate px-1.5">{char.name}</p>
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    {selected.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[12px] text-[#999]">{tag}</span>))}
                  </div>
                </div>
                <button onClick={openInfoModal} className="h-7 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200 shrink-0">
                  <Pencil size={12} strokeWidth={1.5} />编辑
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <div><span className="text-[12px] text-[#666]">角色小传</span><p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">{localInfo.bio || "暂无"}</p></div>
                <div><span className="text-[12px] text-[#666]">音色描述</span><p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">{localInfo.voiceDescription || "暂无"}</p></div>
              </div>
            </div>

            {localVariants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4"><User size={24} strokeWidth={1.5} className="text-[#666]" /></div>
                <p className="text-[14px] text-[#666] mb-4">暂无形象，添加第一个形象开始创作</p>
                <button className="h-8 px-4 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"><Plus size={14} strokeWidth={1.5} />添加形象</button>
              </div>
            ) : (
              <div className="space-y-4">
                {localVariants.map((variant) => (
                  <CharacterVariantCard
                    key={variant.id}
                    variant={variant}
                    editingNameId={editingNameId}
                    nameDraft={nameDraft}
                    moreMenuId={moreMenuId}
                    editingImgId={editingImgId}
                    imgNameDraft={imgNameDraft}
                    onStartEditName={startEditName}
                    onSaveName={saveName}
                    setNameDraft={setNameDraft}
                    setEditingNameId={setEditingNameId}
                    onOpenVariantModal={openVariantModal}
                    onOpenGenerate={openGenerate}
                    onSetMoreMenuId={setMoreMenuId}
                    onDeleteVariant={deleteVariant}
                    onStartEditImageName={startEditImageName}
                    onSaveImageName={saveImageName}
                    setImgNameDraft={setImgNameDraft}
                    setEditingImgId={setEditingImgId}
                    onSetPrimary={setPrimary}
                  />
                ))}
                <button className="w-full h-11 rounded-xl border border-dashed border-white/[0.1] text-[13px] text-[#666] flex items-center justify-center gap-2 hover:border-white/[0.2] hover:text-[#999] transition-colors duration-200">
                  <Plus size={14} strokeWidth={1.5} />添加形象
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CharacterEditModal
        editModal={editModal}
        isInfoModal={editModal === "info"}
        infoDraft={infoDraft}
        setInfoDraft={setInfoDraft}
        variantDraft={variantDraft}
        setVariantDraft={setVariantDraft}
        onClose={() => setEditModal(null)}
        onSave={saveModal}
      />

      <ImageGenerateOverlay open={generateOpen} onClose={() => setGenerateOpen(false)} variantName={generateVariantName} />
    </div>
  );
}
