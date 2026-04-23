"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Search, Plus, FileText, Upload, Sparkles, ChevronRight, BookOpen, User, Mountain, Package, X, MoreHorizontal, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { getElementsByProject } from "@/mocks/elements";
import { getScriptByProject } from "@/mocks/scripts";
import { ElementType, ElementItem } from "@/mocks/types";
import { ScriptOverlay } from "@/components/script-overlay";
import { CharacterEditor } from "@/components/character-editor";
import { SceneEditor } from "@/components/scene-editor";
import { ScriptImportOverlay } from "@/components/script-import-overlay";
import { RecognitionOverlay } from "@/components/recognition-overlay";
import { ExtractionProgressOverlay } from "@/components/extraction-progress-overlay";

const typeTabs: { key: ElementType; label: string }[] = [
  { key: "character", label: "角色" },
  { key: "scene", label: "场景" },
  { key: "prop", label: "道具" },
  { key: "audio", label: "音效" },
];


const typeLabels: Record<string, string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  audio: "音效",
};

export default function ElementsPage() {
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const tab = sessionStorage.getItem("dev-nav-tab");
      if (tab) {
        sessionStorage.removeItem("dev-nav-tab");
        return tab;
      }
    }
    return "character";
  });  const [scriptOpen, setScriptOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [localElements, setLocalElements] = useState<ElementItem[]>(() => getElementsByProject(params.id));
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scriptImportOpen, setScriptImportOpen] = useState(false);
  const [recognitionOpen, setRecognitionOpen] = useState(false);
  const [extractionProgressOpen, setExtractionProgressOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function deleteElement(id: string) {
    setLocalElements((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirmId(null);
    setMoreMenuId(null);
  }
  const script = getScriptByProject(params.id);
  const hasScript = script.content !== null;

  // 过滤掉 script 类型，按当前 Tab 筛选
  const visibleElements = localElements.filter((e) => e.type !== "script");
  const filtered = visibleElements.filter((e) => {
    if (e.type !== activeTab) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // 项目整体是否有元素（决定空状态）
  const isEmpty = visibleElements.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 — 有元素时才显示 */}
      {!isEmpty && (
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1">
          <div className="flex gap-1 p-0.5 rounded-full bg-white/5">
            {typeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 h-7 rounded-full text-[13px] transition-all duration-200 flex items-center ${
                  activeTab === tab.key
                    ? "bg-white/10 text-white"
                    : "text-[#999999] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {hasScript && (
            <>
              <div className="w-px h-5 bg-white/[0.06] mx-1" />
              <button
                onClick={() => setScriptOpen(true)}
                className="h-8 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
              >
                <BookOpen size={14} strokeWidth={1.5} />
                查看剧本
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <div className="h-8 px-3 rounded-full bg-[#262626] border border-white/[0.08] flex items-center gap-2">
              <Search size={14} strokeWidth={1.5} className="text-[#666] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索元素..."
                autoFocus
                className="bg-transparent text-[12px] text-white placeholder:text-[#666] outline-none w-32"
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); setSearchOpen(false); } }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-[#666] hover:text-white transition-colors duration-200">
                  <X size={12} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="h-8 px-3 rounded-full bg-[#262626] flex items-center gap-2 text-[12px] text-[#666] hover:text-[#999] transition-colors duration-200"
            >
              <Search size={14} strokeWidth={1.5} />
              搜索元素...
            </button>
          )}
          <button
            onClick={() => setExtractionProgressOpen(true)}
            className="h-8 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
          >
            <Sparkles size={14} strokeWidth={1.5} />
            {isEmpty ? "识别元素" : "重新识别"}
          </button>
          <button onClick={() => setCreateOpen(true)} className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200">
            <Plus size={14} strokeWidth={1.5} />
            添加{typeLabels[activeTab]}
          </button>
        </div>
      </div>
      )}

      {/* 内容区 */}
      <div className="flex-1 overflow-auto p-6" onClick={() => setMoreMenuId(null)}>
        {isEmpty && !hasScript ? (
          /* 状态1：无剧本 + 无元素 → 两个入口 */
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md w-full space-y-8 text-center">
              <div>
                <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                  <Sparkles size={28} strokeWidth={1.5} className="text-[#666]" />
                </div>
                <h2 className="text-lg font-medium mb-2">开始构建元素库</h2>
                <p className="text-[14px] text-[#666] leading-[1.7]">
                  从剧本自动提取角色、场景、道具等元素，或手动逐个添加。
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setScriptImportOpen(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#00CAE0]/20 bg-[#00CAE0]/[0.04] text-left hover:shadow-[0_0_0_1px_rgba(0,202,224,0.3)] transition-shadow duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00CAE0]/15 flex items-center justify-center shrink-0">
                    <Sparkles size={18} strokeWidth={1.5} className="text-[#00CAE0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">从剧本提取元素</p>
                    <p className="text-[12px] text-[#666] mt-0.5">粘贴或上传剧本，AI 自动分析提取</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#00CAE0]/40 group-hover:text-[#00CAE0] transition-colors duration-200" />
                </button>

                <button
                  onClick={() => setCreateOpen(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#141414] text-left hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Plus size={18} strokeWidth={1.5} className="text-[#999]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">手动添加</p>
                    <p className="text-[12px] text-[#666] mt-0.5">逐个添加角色、场景等元素</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#444] group-hover:text-[#999] transition-colors duration-200" />
                </button>
              </div>
            </div>
          </div>
        ) : isEmpty && hasScript ? (
          /* 状态2：有剧本 + 无元素 → 开始识别 */
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md w-full space-y-8 text-center">
              <div>
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#00CAE0]/10 flex items-center justify-center mb-5">
                  <Sparkles size={28} strokeWidth={1.5} className="text-[#00CAE0]" />
                </div>
                <h2 className="text-lg font-medium mb-2">开始构建元素库</h2>
                <p className="text-[14px] text-[#666] leading-[1.7]">
                  剧本已就绪，AI 将自动分析并提取角色、场景、道具等元素。
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setRecognitionOpen(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#00CAE0]/20 bg-[#00CAE0]/[0.04] text-left hover:shadow-[0_0_0_1px_rgba(0,202,224,0.3)] transition-shadow duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00CAE0]/15 flex items-center justify-center shrink-0">
                    <Sparkles size={18} strokeWidth={1.5} className="text-[#00CAE0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">从剧本提取元素</p>
                    <p className="text-[12px] text-[#666] mt-0.5">AI 自动分析剧本并提取所有元素</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#00CAE0]/40 group-hover:text-[#00CAE0] transition-colors duration-200" />
                </button>

                <button
                  onClick={() => setCreateOpen(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#141414] text-left hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Plus size={18} strokeWidth={1.5} className="text-[#999]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">手动添加</p>
                    <p className="text-[12px] text-[#666] mt-0.5">逐个添加角色、场景等元素</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#444] group-hover:text-[#999] transition-colors duration-200" />
                </button>

                <button
                  onClick={() => setScriptOpen(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#141414] text-left hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <BookOpen size={18} strokeWidth={1.5} className="text-[#999]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">查看剧本</p>
                    <p className="text-[12px] text-[#666] mt-0.5">先回顾剧本内容再决定</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#444] group-hover:text-[#999] transition-colors duration-200" />
                </button>
              </div>
            </div>
          </div>
        ) : !isEmpty && filtered.length === 0 && searchQuery ? (
          /* 搜索无结果 */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
              <Search size={24} strokeWidth={1.5} className="text-[#444]" />
            </div>
            <p className="text-[15px] text-[#999] mb-1">未找到匹配的元素</p>
            <p className="text-[13px] text-[#666]">
              没有包含「{searchQuery}」的{typeLabels[activeTab]}
            </p>
          </div>
        ) : !isEmpty && filtered.length === 0 ? (
          /* 状态3：有元素但当前 Tab 为空 */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
              {activeTab === "character" ? <User size={24} strokeWidth={1.5} className="text-[#444]" /> :
               activeTab === "scene" ? <Mountain size={24} strokeWidth={1.5} className="text-[#444]" /> :
               activeTab === "prop" ? <Package size={24} strokeWidth={1.5} className="text-[#444]" /> :
               <Sparkles size={24} strokeWidth={1.5} className="text-[#444]" />}
            </div>
            <p className="text-[15px] text-[#999] mb-1">暂无{typeLabels[activeTab]}</p>
            <p className="text-[13px] text-[#666] mb-5">添加{typeLabels[activeTab]}素材丰富项目内容</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
            >
              <Plus size={14} strokeWidth={1.5} />
              添加{typeLabels[activeTab]}
            </button>
          </div>
        ) : (
          /* 有元素时显示网格 */
          <div className={activeTab === "scene" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : activeTab === "audio" ? "space-y-1.5" : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"}>
            {filtered.map((element) => {
              if (activeTab === "audio") {
                return (
                  <div
                    key={element.id}
                    className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-[#141414] cursor-pointer hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#262626] flex items-center justify-center shrink-0">
                      <Sparkles size={16} strokeWidth={1.5} className="text-[#666]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{element.name}</p>
                      <p className="text-[12px] text-[#666] mt-0.5">{element.tags.join(" · ")}</p>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setMoreMenuId(moreMenuId === element.id ? null : element.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                      >
                        <MoreHorizontal size={16} strokeWidth={1.5} />
                      </button>
                      {moreMenuId === element.id && (
                        <div className="absolute right-0 top-full mt-1 w-28 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10">
                          <button
                            onClick={() => { setDeleteConfirmId(element.id); setMoreMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#ef4444] hover:bg-white/[0.06] transition-colors duration-200"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (activeTab === "character") {
                return (
                  <div
                    key={element.id}
                    onClick={() => { if (moreMenuId !== element.id) setEditingCharacterId(element.id); }}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${moreMenuId === element.id ? "z-10" : ""}`}
                  >
                    <div className="relative aspect-[9/16] bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                      <User size={32} strokeWidth={1} className="text-white/[0.06]" />
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2.5 pt-12">
                        <p className="text-xs font-medium text-white truncate">{element.name}</p>
                        {element.variants && element.variants.length > 1 && (
                          <p className="mt-0.5 text-[10px] text-white/60">{element.variants.length} 个形象</p>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setMoreMenuId(moreMenuId === element.id ? null : element.id)}
                          className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/60 transition-all duration-200"
                        >
                          <MoreHorizontal size={14} strokeWidth={1.5} />
                        </button>
                        {moreMenuId === element.id && (
                          <div className="absolute right-0 top-full mt-1 w-28 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                            <button
                              onClick={() => { setDeleteConfirmId(element.id); setMoreMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#ef4444] hover:bg-white/[0.06] transition-colors duration-200"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              if (activeTab === "scene") {
                return (
                  <div
                    key={element.id}
                    onClick={() => { if (moreMenuId !== element.id) setEditingSceneId(element.id); }}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${moreMenuId === element.id ? "z-10" : ""}`}
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                      <Mountain size={32} strokeWidth={1} className="text-white/[0.06]" />
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-14">
                        <p className="text-sm font-medium text-white truncate">{element.name}</p>
                      </div>
                      <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setMoreMenuId(moreMenuId === element.id ? null : element.id)}
                          className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/60 transition-all duration-200"
                        >
                          <MoreHorizontal size={14} strokeWidth={1.5} />
                        </button>
                        {moreMenuId === element.id && (
                          <div className="absolute right-0 top-full mt-1 w-28 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                            <button
                              onClick={() => { setDeleteConfirmId(element.id); setMoreMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#ef4444] hover:bg-white/[0.06] transition-colors duration-200"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // prop
              return (
                <div
                  key={element.id}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${moreMenuId === element.id ? "z-10" : ""}`}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                    <Package size={32} strokeWidth={1} className="text-white/[0.06]" />
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2.5 pt-8">
                      <p className="text-xs font-medium text-white truncate">{element.name}</p>
                      {element.tags.length > 0 && (
                        <p className="mt-0.5 text-[10px] text-white/60 truncate">{element.tags.join(" · ")}</p>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setMoreMenuId(moreMenuId === element.id ? null : element.id)}
                        className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/60 transition-all duration-200"
                      >
                        <MoreHorizontal size={14} strokeWidth={1.5} />
                      </button>
                      {moreMenuId === element.id && (
                        <div className="absolute right-0 top-full mt-1 w-28 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                          <button
                            onClick={() => { setDeleteConfirmId(element.id); setMoreMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#ef4444] hover:bg-white/[0.06] transition-colors duration-200"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 创建元素 Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[420px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-[15px] font-medium">添加{typeLabels[activeTab]}</h3>
              <button
                onClick={() => { setCreateOpen(false); setCreateName(""); }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="block text-[12px] text-[#666] mb-1.5">名称</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder={`输入${typeLabels[activeTab]}名称`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && createName.trim()) {
                    setLocalElements((prev) => [...prev, {
                      id: `el-${Date.now()}`,
                      projectId: params.id,
                      type: activeTab as ElementType,
                      name: createName.trim(),
                      thumbnailUrl: "",
                      tags: [],
                      createdAt: new Date().toISOString().slice(0, 10),
                    }]);
                    setCreateName("");
                    setCreateOpen(false);
                  }
                }}
                className="w-full bg-[#262626] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0]/50 focus:ring-1 focus:ring-[#00CAE0]/30 transition-colors duration-200"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
              <button
                onClick={() => { setCreateOpen(false); setCreateName(""); }}
                className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!createName.trim()) return;
                  setLocalElements((prev) => [...prev, {
                    id: `el-${Date.now()}`,
                    projectId: params.id,
                    type: activeTab as ElementType,
                    name: createName.trim(),
                    thumbnailUrl: "",
                    tags: [],
                    createdAt: new Date().toISOString().slice(0, 10),
                  }]);
                  setCreateName("");
                  setCreateOpen(false);
                }}
                disabled={!createName.trim()}
                className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 剧本 Overlay */}
      <ScriptOverlay open={scriptOpen} onClose={() => setScriptOpen(false)} projectId={params.id} />

      {/* 角色编辑 Overlay */}
      <CharacterEditor
        open={editingCharacterId !== null}
        onClose={() => setEditingCharacterId(null)}
        projectId={params.id}
        characterId={editingCharacterId ?? ""}
      />

      {/* 场景编辑 Overlay */}
      <SceneEditor
        open={editingSceneId !== null}
        onClose={() => setEditingSceneId(null)}
        projectId={params.id}
        sceneId={editingSceneId ?? ""}
      />

      {/* 道具/音效编辑 Overlay — 占位 */}
      {(activeTab === "prop" || activeTab === "audio") && editingCharacterId === null && editingSceneId === null && filtered.length > 0 && (
        <div className="hidden" />
      )}

      {/* 导入剧本面板 */}
      <ScriptImportOverlay
        open={scriptImportOpen}
        onClose={() => setScriptImportOpen(false)}
        onAnalysisStart={() => {
          setScriptImportOpen(false);
          setExtractionProgressOpen(true);
        }}
      />

      {/* 提取进度 */}
      <ExtractionProgressOverlay
        open={extractionProgressOpen}
        onCancel={() => setExtractionProgressOpen(false)}
        onComplete={() => {
          setExtractionProgressOpen(false);
          setRecognitionOpen(true);
        }}
      />

      {/* AI 识别 Overlay */}
      <RecognitionOverlay
        open={recognitionOpen}
        onClose={() => setRecognitionOpen(false)}
      />

      {/* 删除确认 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[360px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} strokeWidth={1.5} className="text-red-400" />
                </div>
                <h3 className="text-[15px] font-medium">确认删除</h3>
              </div>
              <p className="text-[13px] text-[#999] leading-[1.7]">
                确定要删除该元素吗？此操作无法撤销。
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={() => deleteElement(deleteConfirmId)}
                className="h-9 px-5 rounded-full bg-red-500/90 text-white text-[13px] font-medium hover:bg-red-500 active:scale-[0.97] transition-all duration-200"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
