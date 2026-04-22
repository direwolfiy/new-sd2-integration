"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Search, Plus, FileText, Upload, Sparkles, ChevronRight, BookOpen, User, Mountain, Package } from "lucide-react";
import { getElementsByProject } from "@/mocks/elements";
import { getScriptByProject } from "@/mocks/scripts";
import { ElementType } from "@/mocks/types";
import { ScriptOverlay } from "@/components/script-overlay";
import { CharacterEditor } from "@/components/character-editor";
import { SceneEditor } from "@/components/scene-editor";

const typeTabs: { key: ElementType; label: string }[] = [
  { key: "character", label: "角色" },
  { key: "scene", label: "场景" },
  { key: "prop", label: "道具" },
  { key: "audio", label: "音效" },
];


export default function ElementsPage() {
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("character");
  const [scriptOpen, setScriptOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const allElements = getElementsByProject(params.id);
  const script = getScriptByProject(params.id);
  const hasScript = script.content !== null;

  // 过滤掉 script 类型，按当前 Tab 筛选
  const visibleElements = allElements.filter((e) => e.type !== "script");
  const filtered = visibleElements.filter((e) => e.type === activeTab);

  // 项目整体是否有元素（决定空状态）
  const isEmpty = visibleElements.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
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
          <div className="h-8 px-3 rounded-full bg-[#262626] flex items-center gap-2 text-[12px] text-[#666]">
            <Search size={14} strokeWidth={1.5} />
            搜索元素...
          </div>
          <button className="h-8 px-3 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
            <Sparkles size={14} strokeWidth={1.5} />
            {isEmpty ? "识别元素" : "重新识别"}
          </button>
          <button className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200">
            <Plus size={14} strokeWidth={1.5} />
            添加元素
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto p-6">
        {isEmpty ? (
          /* 空项目引导 — 导入剧本 */
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md w-full space-y-8 text-center">
              <div>
                <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                  <FileText size={28} strokeWidth={1.5} className="text-[#666]" />
                </div>
                <h2 className="text-lg font-medium mb-2">导入剧本开始创作</h2>
                <p className="text-[14px] text-[#666] leading-[1.7]">
                  粘贴或上传剧本，AI 将自动提取角色、场景、道具等元素，快速构建项目素材库。
                </p>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#141414] text-left hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 group">
                  <div className="w-10 h-10 rounded-lg bg-[#00CAE0]/10 flex items-center justify-center shrink-0">
                    <FileText size={18} strokeWidth={1.5} className="text-[#00CAE0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">粘贴剧本文本</p>
                    <p className="text-[12px] text-[#666] mt-0.5">直接粘贴剧本内容，支持多集格式</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#444] group-hover:text-[#999] transition-colors duration-200" />
                </button>

                <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#141414] text-left hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 group">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Upload size={18} strokeWidth={1.5} className="text-[#999]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">上传剧本文件</p>
                    <p className="text-[12px] text-[#666] mt-0.5">支持 TXT、DOCX、PDF 格式</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#444] group-hover:text-[#999] transition-colors duration-200" />
                </button>

                <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#141414] text-left hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 group">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Sparkles size={18} strokeWidth={1.5} className="text-[#999]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">跳过，手动创建</p>
                    <p className="text-[12px] text-[#666] mt-0.5">直接添加角色、场景等元素</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-[#444] group-hover:text-[#999] transition-colors duration-200" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 有元素时显示网格 */
          <div className={activeTab === "scene" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : activeTab === "audio" ? "space-y-1.5" : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"}>
            {filtered.map((element) => {
              if (activeTab === "audio") {
                return (
                  <div
                    key={element.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-[#141414] cursor-pointer hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#262626] flex items-center justify-center shrink-0">
                      <Sparkles size={16} strokeWidth={1.5} className="text-[#666]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{element.name}</p>
                      <p className="text-[12px] text-[#666] mt-0.5">{element.tags.join(" · ")}</p>
                    </div>
                  </div>
                );
              }

              if (activeTab === "character") {
                return (
                  <div
                    key={element.id}
                    onClick={() => setEditingCharacterId(element.id)}
                    className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative aspect-[9/16] bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                      <User size={32} strokeWidth={1} className="text-white/[0.06]" />
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2.5 pt-12">
                        <p className="text-xs font-medium text-white truncate">{element.name}</p>
                        {element.variants && element.variants.length > 1 && (
                          <p className="mt-0.5 text-[10px] text-white/60">{element.variants.length} 个形象</p>
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
                    onClick={() => setEditingSceneId(element.id)}
                    className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                      <Mountain size={32} strokeWidth={1} className="text-white/[0.06]" />
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-14">
                        <p className="text-sm font-medium text-white truncate">{element.name}</p>
                      </div>
                    </div>
                  </div>
                );
              }

              // prop
              return (
                <div
                  key={element.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                    <Package size={32} strokeWidth={1} className="text-white/[0.06]" />
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2.5 pt-8">
                      <p className="text-xs font-medium text-white truncate">{element.name}</p>
                      {element.tags.length > 0 && (
                        <p className="mt-0.5 text-[10px] text-white/60 truncate">{element.tags.join(" · ")}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    </div>
  );
}
