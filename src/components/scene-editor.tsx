"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Star,
  Plus,
  Mountain,
  Pencil,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  getElementsByType,
  sceneDetails,
  sceneInfo,
} from "@/mocks/elements";
import { SceneState, SceneInfoDetail } from "@/mocks/types";
import { ImageGenerateOverlay } from "./image-generate-overlay";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sceneId: string;
}

const inputCls =
  "w-full bg-[#262626] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0]/50 focus:ring-1 focus:ring-[#00CAE0]/30 transition-colors duration-200";

export function SceneEditor({
  open,
  onClose,
  projectId,
  sceneId,
}: Props) {
  const scenes = getElementsByType(projectId, "scene");
  const [selectedId, setSelectedId] = useState(sceneId);

  const [localInfo, setLocalInfo] = useState<SceneInfoDetail>({
    location: "",
    mood: "",
  });
  const [localStates, setLocalStates] = useState<SceneState[]>([]);

  // Edit modal
  const [editModal, setEditModal] = useState<string | null>(null);
  const [infoDraft, setInfoDraft] = useState<SceneInfoDetail>({
    location: "",
    mood: "",
  });
  const [stateDraft, setStateDraft] = useState({
    name: "",
    description: "",
    episodes: [] as number[],
  });

  // Inline state name editing
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Inline image name editing
  const [editingImgId, setEditingImgId] = useState<string | null>(null);
  const [imgNameDraft, setImgNameDraft] = useState("");
  const imgNameInputRef = useRef<HTMLInputElement>(null);

  // More menu
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);

  // Image generate overlay
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateStateName, setGenerateStateName] = useState("");

  useEffect(() => {
    setSelectedId(sceneId);
  }, [sceneId]);

  useEffect(() => {
    setLocalInfo(
      sceneInfo[selectedId] ?? { location: "", mood: "" }
    );
    setLocalStates(sceneDetails[selectedId] ?? []);
    setEditModal(null);
    setMoreMenuId(null);
    setEditingNameId(null);
    setEditingImgId(null);
  }, [selectedId]);

  useEffect(() => {
    if (editingNameId && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingNameId]);

  useEffect(() => {
    if (editingImgId && imgNameInputRef.current) {
      imgNameInputRef.current.focus();
      imgNameInputRef.current.select();
    }
  }, [editingImgId]);

  const selected = scenes.find((s) => s.id === selectedId);
  if (!open || !selected) return null;

  // -- Edit modal handlers --
  function openInfoModal() {
    setInfoDraft({ ...localInfo });
    setEditModal("info");
  }
  function openStateModal(state: SceneState) {
    setStateDraft({
      name: state.name,
      description: state.description,
      episodes: [...state.episodes],
    });
    setEditModal(state.id);
    setMoreMenuId(null);
  }
  function saveModal() {
    if (editModal === "info") {
      setLocalInfo({ ...infoDraft });
    } else {
      setLocalStates((prev) =>
        prev.map((s) =>
          s.id === editModal ? { ...s, ...stateDraft } : s
        )
      );
    }
    setEditModal(null);
  }

  // -- Inline name editing --
  function startEditName(state: SceneState) {
    setNameDraft(state.name);
    setEditingNameId(state.id);
    setMoreMenuId(null);
  }
  function saveName() {
    if (editingNameId && nameDraft.trim()) {
      setLocalStates((prev) =>
        prev.map((s) =>
          s.id === editingNameId ? { ...s, name: nameDraft.trim() } : s
        )
      );
    }
    setEditingNameId(null);
  }

  // -- Inline image name editing --
  function startEditImageName(stateId: string, imgId: string, currentName: string) {
    setImgNameDraft(currentName);
    setEditingImgId(`${stateId}::${imgId}`);
  }
  function saveImageName() {
    if (!editingImgId || !imgNameDraft.trim()) {
      setEditingImgId(null);
      return;
    }
    const [stateId, imgId] = editingImgId.split("::");
    setLocalStates((prev) =>
      prev.map((s) =>
        s.id !== stateId
          ? s
          : {
              ...s,
              images: s.images.map((img) =>
                img.id === imgId ? { ...img, name: imgNameDraft.trim() } : img
              ),
            }
      )
    );
    setEditingImgId(null);
  }

  // -- Delete state --
  function deleteState(stateId: string) {
    setLocalStates((prev) => prev.filter((s) => s.id !== stateId));
    setMoreMenuId(null);
  }

  // -- Primary image --
  function setPrimary(stateId: string, imageId: string) {
    setLocalStates((prev) =>
      prev.map((s) =>
        s.id !== stateId
          ? s
          : {
              ...s,
              images: s.images.map((img) => ({
                ...img,
                isPrimary: img.id === imageId,
              })),
            }
      )
    );
  }

  // -- Image generate --
  function openGenerate(state: SceneState) {
    setGenerateStateName(state.name);
    setGenerateOpen(true);
    setMoreMenuId(null);
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

  const isInfoModal = editModal === "info";
  const modalTitle = isInfoModal ? "编辑场景信息" : "编辑状态";

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/[0.06]">
        <span className="text-[15px] font-medium">场景设计</span>
        <button
          onClick={onClose}
          className="h-8 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
        >
          关闭
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <nav className="w-[160px] shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedId(scene.id)}
                className={`shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                  selectedId === scene.id
                    ? "ring-2 ring-white/20 bg-white/[0.04]"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <div className="relative aspect-video bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center">
                  <Mountain
                    size={20}
                    strokeWidth={1}
                    className="text-white/[0.06]"
                  />
                </div>
                <p className="text-[11px] text-center py-1.5 truncate px-1.5">
                  {scene.name}
                </p>
              </button>
            ))}
          </div>
        </nav>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Scene basic info */}
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[12px] text-[#999]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={openInfoModal}
                  className="h-7 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200 shrink-0"
                >
                  <Pencil size={12} strokeWidth={1.5} />
                  编辑
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-[12px] text-[#666]">场景位置</span>
                  <p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">
                    {localInfo.location || "暂无"}
                  </p>
                </div>
                <div>
                  <span className="text-[12px] text-[#666]">氛围描述</span>
                  <p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">
                    {localInfo.mood || "暂无"}
                  </p>
                </div>
              </div>
            </div>

            {/* States */}
            {localStates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                  <Mountain
                    size={24}
                    strokeWidth={1.5}
                    className="text-[#666]"
                  />
                </div>
                <p className="text-[14px] text-[#666] mb-4">
                  暂无状态，添加第一个状态开始创作
                </p>
                <button className="h-8 px-4 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                  <Plus size={14} strokeWidth={1.5} />
                  添加状态
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {localStates.map((state) => (
                  <div
                    key={state.id}
                    className="rounded-xl border border-white/[0.06] bg-[#141414] p-4"
                  >
                    {/* State header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {editingNameId === state.id ? (
                          <input
                            ref={nameInputRef}
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            onBlur={saveName}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveName();
                              if (e.key === "Escape")
                                setEditingNameId(null);
                            }}
                            className="h-7 px-2 rounded-md bg-[#262626] border border-white/[0.1] text-[14px] text-white font-medium outline-none focus:border-[#00CAE0]/50 w-32"
                          />
                        ) : (
                          <button
                            onClick={() => startEditName(state)}
                            className="text-[14px] font-medium text-white hover:text-white/80 transition-colors duration-200"
                          >
                            {state.name}
                          </button>
                        )}
                        <span className="text-[12px] text-[#666]">
                          {state.images.length} 张
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openStateModal(state)}
                          className="h-7 px-2.5 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
                        >
                          <Pencil size={11} strokeWidth={1.5} />
                          编辑信息
                        </button>
                        <button
                          onClick={() => openGenerate(state)}
                          className="h-7 px-2.5 rounded-full bg-[rgba(0,202,224,0.08)] text-[12px] text-[rgba(0,202,224,0.8)] border border-[rgba(0,202,224,0.15)] flex items-center gap-1 hover:bg-[rgba(0,202,224,0.12)] transition-colors duration-200"
                        >
                          修改场景图
                        </button>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMoreMenuId(
                                moreMenuId === state.id ? null : state.id
                              )
                            }
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
                          >
                            <MoreHorizontal size={16} strokeWidth={1.5} />
                          </button>
                          {moreMenuId === state.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10">
                              <button
                                onClick={() => deleteState(state.id)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#ef4444] hover:bg-white/[0.06] transition-colors duration-200"
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                                删除状态
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Image strip — landscape cards */}
                    <div className="flex gap-4">
                      {state.images.map((img) => {
                        const imgKey = `${state.id}::${img.id}`;
                        const isEditingImg = editingImgId === imgKey;
                        return (
                          <div
                            key={img.id}
                            className="group relative w-[240px] shrink-0 rounded-lg overflow-hidden border border-white/[0.06] bg-[#0a0a0a] transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                          >
                            <div
                              onClick={() => openGenerate(state)}
                              className="relative aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center cursor-pointer"
                            >
                              <Mountain
                                size={32}
                                strokeWidth={1}
                                className="text-white/[0.06]"
                              />
                              {/* Primary toggle — top right */}
                              {img.isPrimary ? (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00CAE0]/20 flex items-center justify-center">
                                  <Star
                                    size={10}
                                    strokeWidth={1.5}
                                    className="text-[#00CAE0] fill-[#00CAE0]"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPrimary(state.id, img.id);
                                  }}
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/[0.12]"
                                >
                                  <Star
                                    size={10}
                                    strokeWidth={1.5}
                                    className="text-[#666] group-hover:text-[#999]"
                                  />
                                </button>
                              )}
                            </div>
                            {/* Image name */}
                            <div className="px-2 py-1.5 border-t border-white/[0.04]">
                              {isEditingImg ? (
                                <input
                                  ref={imgNameInputRef}
                                  value={imgNameDraft}
                                  onChange={(e) => setImgNameDraft(e.target.value)}
                                  onBlur={saveImageName}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveImageName();
                                    if (e.key === "Escape") setEditingImgId(null);
                                  }}
                                  className="w-full bg-transparent text-[11px] text-white outline-none"
                                />
                              ) : (
                                <button
                                  onClick={() => startEditImageName(state.id, img.id, img.name)}
                                  className="w-full text-left text-[11px] text-[#999] hover:text-white transition-colors duration-200 truncate"
                                >
                                  {img.name}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button className="w-full h-11 rounded-xl border border-dashed border-white/[0.1] text-[13px] text-[#666] flex items-center justify-center gap-2 hover:border-white/[0.2] hover:text-[#999] transition-colors duration-200">
                  <Plus size={14} strokeWidth={1.5} />
                  添加状态
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editModal !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[480px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-[15px] font-medium">{modalTitle}</h3>
              <button
                onClick={() => setEditModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {isInfoModal ? (
                <>
                  <div>
                    <label className="block text-[12px] text-[#666] mb-1.5">
                      场景位置
                    </label>
                    <textarea
                      value={infoDraft.location}
                      onChange={(e) =>
                        setInfoDraft((d) => ({ ...d, location: e.target.value }))
                      }
                      rows={3}
                      className={inputCls + " resize-none leading-[1.7]"}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#666] mb-1.5">
                      氛围描述
                    </label>
                    <textarea
                      value={infoDraft.mood}
                      onChange={(e) =>
                        setInfoDraft((d) => ({ ...d, mood: e.target.value }))
                      }
                      rows={3}
                      className={inputCls + " resize-none leading-[1.7]"}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[12px] text-[#666] mb-1.5">
                        状态名称
                      </label>
                      <input
                        type="text"
                        value={stateDraft.name}
                        onChange={(e) =>
                          setStateDraft((d) => ({
                            ...d,
                            name: e.target.value,
                          }))
                        }
                        className={inputCls}
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-[12px] text-[#666] mb-1.5">
                        出现集数
                      </label>
                      <input
                        type="text"
                        value={episodeLabels(stateDraft.episodes)}
                        onChange={(e) =>
                          setStateDraft((d) => ({
                            ...d,
                            episodes: parseEpisodes(e.target.value),
                          }))
                        }
                        placeholder="如：1, 2, 3"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#666] mb-1.5">
                      状态描述
                    </label>
                    <textarea
                      value={stateDraft.description}
                      onChange={(e) =>
                        setStateDraft((d) => ({
                          ...d,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className={inputCls + " resize-none leading-[1.7]"}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
              <button
                onClick={() => setEditModal(null)}
                className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={saveModal}
                className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image generate overlay */}
      <ImageGenerateOverlay
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        variantName={generateStateName}
      />
    </div>
  );
}
