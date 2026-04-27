"use client";

import { useState, useEffect } from "react";
import { X, Mountain, Plus, Pencil } from "lucide-react";
import { getElementsByType, sceneDetails, sceneInfo } from "@/mocks/elements";
import { SceneState, SceneInfoDetail } from "@/mocks/types";
import { SceneImageGenerateOverlay } from "./scene-image-generate-overlay";
import { SceneEditModal } from "./scene/scene-edit-modal";
import { SceneStateCard } from "./scene/scene-state-card";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sceneId: string;
}

export function SceneEditor({ open, onClose, projectId, sceneId }: Props) {
  const scenes = getElementsByType(projectId, "scene");
  const [selectedId, setSelectedId] = useState(sceneId);
  const [localInfo, setLocalInfo] = useState<SceneInfoDetail>({ location: "", mood: "" });
  const [localStates, setLocalStates] = useState<SceneState[]>([]);
  const [editModal, setEditModal] = useState<string | null>(null);
  const [infoDraft, setInfoDraft] = useState<SceneInfoDetail>({ location: "", mood: "" });
  const [stateDraft, setStateDraft] = useState({ name: "", description: "", episodes: [] as number[] });
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [editingImgId, setEditingImgId] = useState<string | null>(null);
  const [imgNameDraft, setImgNameDraft] = useState("");
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateStateName, setGenerateStateName] = useState("");

  useEffect(() => { setSelectedId(sceneId); }, [sceneId]);

  useEffect(() => {
    setLocalInfo(sceneInfo[selectedId] ?? { location: "", mood: "" });
    setLocalStates(sceneDetails[selectedId] ?? []);
    setEditModal(null); setMoreMenuId(null); setEditingNameId(null); setEditingImgId(null);
  }, [selectedId]);

  const selected = scenes.find((s) => s.id === selectedId);
  if (!open || !selected) return null;

  function openInfoModal() { setInfoDraft({ ...localInfo }); setEditModal("info"); }
  function openStateModal(state: SceneState) { setStateDraft({ name: state.name, description: state.description, episodes: [...state.episodes] }); setEditModal(state.id); setMoreMenuId(null); }
  function saveModal() {
    if (editModal === "info") setLocalInfo({ ...infoDraft });
    else setLocalStates((prev) => prev.map((s) => s.id === editModal ? { ...s, ...stateDraft } : s));
    setEditModal(null);
  }
  function startEditName(state: SceneState) { setNameDraft(state.name); setEditingNameId(state.id); setMoreMenuId(null); }
  function saveName() {
    if (editingNameId && nameDraft.trim()) setLocalStates((prev) => prev.map((s) => s.id === editingNameId ? { ...s, name: nameDraft.trim() } : s));
    setEditingNameId(null);
  }
  function startEditImageName(stateId: string, imgId: string, name: string) { setImgNameDraft(name); setEditingImgId(`${stateId}::${imgId}`); }
  function saveImageName() {
    if (!editingImgId || !imgNameDraft.trim()) { setEditingImgId(null); return; }
    const [stateId, imgId] = editingImgId.split("::");
    setLocalStates((prev) => prev.map((s) => s.id !== stateId ? s : { ...s, images: s.images.map((img) => img.id === imgId ? { ...img, name: imgNameDraft.trim() } : img) }));
    setEditingImgId(null);
  }
  function deleteState(id: string) { setLocalStates((prev) => prev.filter((s) => s.id !== id)); setMoreMenuId(null); }
  function setPrimary(stateId: string, imageId: string) {
    setLocalStates((prev) => prev.map((s) => s.id !== stateId ? s : { ...s, images: s.images.map((img) => ({ ...img, isPrimary: img.id === imageId })) }));
  }
  function openGenerate(state: SceneState) { setGenerateStateName(state.name); setGenerateOpen(true); setMoreMenuId(null); }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/[0.06]">
        <span className="text-[15px] font-medium">场景设计</span>
        <button onClick={onClose} className="h-8 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
          关闭 <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <nav className="w-[160px] shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {scenes.map((scene) => (
              <button key={scene.id} onClick={() => setSelectedId(scene.id)} className={`shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${selectedId === scene.id ? "ring-2 ring-white/20 bg-white/[0.04]" : "opacity-50 hover:opacity-80"}`}>
                <div className="relative aspect-video bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center"><Mountain size={20} strokeWidth={1} className="text-white/[0.06]" /></div>
                <p className="text-[11px] text-center py-1.5 truncate px-1.5">{scene.name}</p>
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
                <div><span className="text-[12px] text-[#666]">场景位置</span><p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">{localInfo.location || "暂无"}</p></div>
                <div><span className="text-[12px] text-[#666]">氛围描述</span><p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">{localInfo.mood || "暂无"}</p></div>
              </div>
            </div>

            {localStates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4"><Mountain size={24} strokeWidth={1.5} className="text-[#666]" /></div>
                <p className="text-[14px] text-[#666] mb-4">暂无状态，添加第一个状态开始创作</p>
                <button className="h-8 px-4 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"><Plus size={14} strokeWidth={1.5} />添加状态</button>
              </div>
            ) : (
              <div className="space-y-4">
                {localStates.map((state) => (
                  <SceneStateCard
                    key={state.id} state={state}
                    editingNameId={editingNameId} nameDraft={nameDraft} moreMenuId={moreMenuId}
                    editingImgId={editingImgId} imgNameDraft={imgNameDraft}
                    onStartEditName={startEditName} onSaveName={saveName} setNameDraft={setNameDraft} setEditingNameId={setEditingNameId}
                    onOpenStateModal={openStateModal} onOpenGenerate={openGenerate} onSetMoreMenuId={setMoreMenuId} onDeleteState={deleteState}
                    onStartEditImageName={startEditImageName} onSaveImageName={saveImageName} setImgNameDraft={setImgNameDraft} setEditingImgId={setEditingImgId}
                    onSetPrimary={setPrimary}
                  />
                ))}
                <button className="w-full h-11 rounded-xl border border-dashed border-white/[0.1] text-[13px] text-[#666] flex items-center justify-center gap-2 hover:border-white/[0.2] hover:text-[#999] transition-colors duration-200">
                  <Plus size={14} strokeWidth={1.5} />添加状态
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SceneEditModal editModal={editModal} isInfoModal={editModal === "info"} infoDraft={infoDraft} setInfoDraft={setInfoDraft} stateDraft={stateDraft} setStateDraft={setStateDraft} onClose={() => setEditModal(null)} onSave={saveModal} />
      <SceneImageGenerateOverlay open={generateOpen} onClose={() => setGenerateOpen(false)} stateName={generateStateName} />
    </div>
  );
}
