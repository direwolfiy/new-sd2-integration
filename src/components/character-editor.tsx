"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X, User, Pencil, MoreHorizontal, Trash2, Star, Plus } from "lucide-react";
import type { SceneRoleItem } from "@/lib/api/types";
import { elementsApi } from "@/lib/api";
import { ImageGenerateOverlay } from "./image-generate-overlay";
import { toast as sonnerToast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  characterId: string;
  roles: SceneRoleItem[];
  onRefresh: () => void;
}

interface CharacterGroup {
  name: string;
  variants: SceneRoleItem[];
}

function extractCharName(templateName: string): string {
  const idx = templateName.indexOf("-");
  return idx > 0 ? templateName.slice(0, idx) : templateName;
}

function groupCharacters(roles: SceneRoleItem[]): CharacterGroup[] {
  const map = new Map<string, SceneRoleItem[]>();
  for (const r of roles) {
    if (r.template_type !== "ROLE") continue;
    const name = extractCharName(r.template_name ?? "");
    if (!map.has(name)) map.set(name, []);
    map.get(name)!.push(r);
  }
  return Array.from(map.entries()).map(([name, variants]) => ({ name, variants }));
}

function getAppearance(v: SceneRoleItem) {
  return v.appearance as Record<string, unknown> | null;
}

const inputCls = "w-full bg-[#262626] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0]/50 focus:ring-1 focus:ring-[#00CAE0]/30 transition-colors duration-200";

export function CharacterEditor({ open, onClose, projectId, characterId, roles, onRefresh }: Props) {
  const groups = useMemo(() => groupCharacters(roles), [roles]);
  const [selectedName, setSelectedName] = useState("");
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [editVariantId, setEditVariantId] = useState<string | null>(null);
  const [generateVariantId, setGenerateVariantId] = useState<string | null>(null);
  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit modal draft state
  const [draftName, setDraftName] = useState("");
  const [draftDesc, setDraftDesc] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [draftEpisodes, setDraftEpisodes] = useState("");

  useEffect(() => {
    const match = groups.find((g) => g.variants.some((v) => String(v.id) === characterId));
    if (match) setSelectedName(match.name);
  }, [characterId, groups]);

  useEffect(() => { setMoreMenuId(null); }, [selectedName]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (generateVariantId !== null) return; // let overlay handle its own ESC
      if (editVariantId !== null) { setEditVariantId(null); (document.activeElement as HTMLElement)?.blur(); return; }
      if (addVariantOpen) { setAddVariantOpen(false); (document.activeElement as HTMLElement)?.blur(); return; }
      if (moreMenuId !== null) { setMoreMenuId(null); return; }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editVariantId, addVariantOpen, generateVariantId, moreMenuId]);

  const selectedGroup = groups.find((g) => g.name === selectedName);

  const saveEdit = useCallback(async () => {
    if (!editVariantId || !selectedGroup) return;
    setSaving(true);
    try {
      const tags = draftTags.split(/[,，、]/).map(t => t.trim()).filter(Boolean);
      await elementsApi.updateCharacter({
        templateId: editVariantId,
        templateName: `${selectedGroup.name}-${draftName}`,
        description: draftDesc,
        tags,
        appearance: {
          name: draftName,
          description: draftDesc,
          tags,
        },
      });
      setEditVariantId(null);
      onRefresh();
      sonnerToast.success("保存成功");
    } catch {
      sonnerToast.error("保存失败");
    } finally {
      setSaving(false);
    }
  }, [editVariantId, selectedGroup, draftName, draftDesc, draftTags, onRefresh]);

  if (!open || !selectedGroup) return null;

  const first = selectedGroup.variants[0];
  const voiceDesc = (first.voice_profile as Record<string, string> | null)?.timbre_description ?? "";
  const charTags = (first.template_metadata as Record<string, unknown> | null)?.tags as string[] | undefined;

  function openEditModal(variant: SceneRoleItem) {
    const app = getAppearance(variant);
    setDraftName(String(app?.name ?? ""));
    setDraftDesc(String(app?.description ?? ""));
    setDraftTags((app?.tags as string[] ?? []).join(", "));
    const eps = app?.episodes as number[] ?? [];
    setDraftEpisodes(eps.map((e) => `第${e}集`).join("、"));
    setEditVariantId(String(variant.resource_temp_id ?? variant.id));
    setMoreMenuId(null);
  }


  function deleteVariant(variantId: string) {
    elementsApi.deleteSceneRole(variantId).then(() => {
      onRefresh();
      sonnerToast.success("已删除");
    }).catch(() => {
      sonnerToast.error("删除失败");
    });
    setMoreMenuId(null);
  }

  async function handleCreateVariant() {
    if (!newVariantName.trim() || !selectedGroup) return;
    try {
      await elementsApi.createCharacter(projectId, {
        templateName: `${selectedGroup.name}-${newVariantName.trim()}`,
        contentId: projectId,
      });
      setAddVariantOpen(false);
      onRefresh();
      sonnerToast.success("创建成功");
    } catch (e) {
      console.error("创建失败", e);
      sonnerToast.error("创建失败");
    }
  }

  const generateVariant = selectedGroup.variants.find((v) => String(v.id) === generateVariantId);
  const generatePrompt = generateVariant ? String(getAppearance(generateVariant)?.imagePrompt ?? "") : "";

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/[0.06]">
        <span className="text-[15px] font-medium">角色设计</span>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="h-8 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
            关闭 <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <nav className="w-[112px] shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <button key={group.name} onClick={() => setSelectedName(group.name)} className={`shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${group.name === selectedName ? "ring-2 ring-white/20 bg-white/[0.04]" : "opacity-50 hover:opacity-80"}`}>
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center">
                  {group.variants[0].cover_image ? (
                    <img src={group.variants[0].cover_image} alt={group.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                  ) : (
                    <User size={20} strokeWidth={1} className="text-white/[0.06]" />
                  )}
                </div>
                <p className="text-[11px] text-center py-1.5 truncate px-1.5">{group.name}</p>
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-white/[0.06] p-4">
              <h2 className="text-lg font-medium">{selectedGroup.name}</h2>
              {charTags && charTags.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  {charTags.map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[12px] text-[#999]">{tag}</span>)}
                </div>
              )}
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-[12px] text-[#666]">角色描述</span>
                  <p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">{first.description || "暂无"}</p>
                </div>
                {voiceDesc && (
                  <div>
                    <span className="text-[12px] text-[#666]">音色描述</span>
                    <p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">{voiceDesc}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedGroup.variants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4"><User size={24} strokeWidth={1.5} className="text-[#666]" /></div>
                <p className="text-[14px] text-[#666] mb-4">暂无形象，添加第一个形象开始创作</p>
                <button onClick={() => { setNewVariantName(""); setAddVariantOpen(true); }} className="h-8 px-4 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"><Plus size={14} strokeWidth={1.5} />添加形象</button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedGroup.variants.map((variant) => {
                  const app = getAppearance(variant);
                  const appTags = app?.tags as string[] | undefined;
                  const appName = String(app?.name ?? variant.template_name?.split("-").slice(1).join("-") ?? "");
                  const isPrimary = variant === selectedGroup.variants[0];
                  return (
                    <div key={variant.id} className="rounded-xl border border-white/[0.06] bg-[#141414] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-white">{appName}</span>
                          {appTags && appTags.map((t) => <span key={t} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[11px] text-[#666]">{t}</span>)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEditModal(variant)} className="h-7 px-2.5 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                            <Pencil size={11} strokeWidth={1.5} />编辑信息
                          </button>
                          <button onClick={() => setGenerateVariantId(String(variant.id))} className="h-7 px-2.5 rounded-full bg-[rgba(0,202,224,0.08)] text-[12px] text-[rgba(0,202,224,0.8)] border border-[rgba(0,202,224,0.15)] flex items-center gap-1 hover:bg-[rgba(0,202,224,0.12)] transition-colors duration-200">
                            修改形象图
                          </button>
                          <div className="relative">
                            <button onClick={() => setMoreMenuId(moreMenuId === String(variant.id) ? null : String(variant.id))} className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
                              <MoreHorizontal size={16} strokeWidth={1.5} />
                            </button>
                            {moreMenuId === String(variant.id) && (
                              <div className="absolute right-0 top-full mt-1 w-32 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10">
                                <button onClick={() => deleteVariant(String(variant.id))} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#ef4444] hover:bg-white/[0.06] transition-colors duration-200">
                                  <Trash2 size={14} strokeWidth={1.5} />删除形象
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div onClick={() => setGenerateVariantId(String(variant.id))} className="group relative w-[140px] shrink-0 rounded-lg overflow-hidden border border-white/[0.06] bg-[#0a0a0a] transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] cursor-pointer">
                          <div className="relative aspect-[3/4] bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                            {variant.cover_image ? (
                              <img src={variant.cover_image} alt={appName} className="absolute inset-0 w-full h-full object-cover object-top" />
                            ) : (
                              <User size={32} strokeWidth={1} className="text-white/[0.06]" />
                            )}
                            {isPrimary && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00CAE0]/20 flex items-center justify-center">
                                <Star size={10} strokeWidth={1.5} className="text-[#00CAE0] fill-[#00CAE0]" />
                              </div>
                            )}
                          </div>
                          <div className="px-2 py-1.5 border-t border-white/[0.04]">
                            <span className="text-[11px] text-[#999] truncate block">{appName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => { setNewVariantName(""); setAddVariantOpen(true); }} className="w-full h-11 rounded-xl border border-dashed border-white/[0.1] text-[13px] text-[#666] flex items-center justify-center gap-2 hover:border-white/[0.2] hover:text-[#999] transition-colors duration-200">
                  <Plus size={14} strokeWidth={1.5} />添加形象
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit variant modal */}
      {editVariantId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditVariantId(null)}>
          <div className="w-[480px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-[15px] font-medium">编辑形象</h3>
              <button onClick={() => setEditVariantId(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[12px] text-[#666] mb-1.5">形象名称</label>
                  <input type="text" value={draftName} onChange={(e) => setDraftName(e.target.value)} className={inputCls} />
                </div>
                <div className="w-36">
                  <label className="block text-[12px] text-[#666] mb-1.5">出现集数</label>
                  <input type="text" value={draftEpisodes} onChange={(e) => setDraftEpisodes(e.target.value)} placeholder="如：第1集、第2集" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-[#666] mb-1.5">标签（逗号分隔）</label>
                <input type="text" value={draftTags} onChange={(e) => setDraftTags(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[12px] text-[#666] mb-1.5">形象描述</label>
                <textarea value={draftDesc} onChange={(e) => setDraftDesc(e.target.value)} rows={3} className={inputCls + " resize-none leading-[1.7]"} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
              <button onClick={() => setEditVariantId(null)} className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">取消</button>
              <button onClick={saveEdit} className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Add variant modal */}
      {addVariantOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAddVariantOpen(false)}>
          <div className="w-[420px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-[15px] font-medium">添加形象</h3>
              <button onClick={() => setAddVariantOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="block text-[12px] text-[#666] mb-1.5">形象名称</label>
              <input
                type="text" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)}
                placeholder="输入形象名称" autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && newVariantName.trim()) handleCreateVariant(); }}
                className={inputCls}
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
              <button onClick={() => setAddVariantOpen(false)} className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">取消</button>
              <button onClick={handleCreateVariant} disabled={!newVariantName.trim()} className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none">创建</button>
            </div>
          </div>
        </div>
      )}

      {/* Image generate overlay */}
      <ImageGenerateOverlay
        open={generateVariantId !== null}
        onClose={() => setGenerateVariantId(null)}
        variantName={generateVariant ? String(getAppearance(generateVariant)?.name ?? "") : ""}
      />
    </div>
  );
}
