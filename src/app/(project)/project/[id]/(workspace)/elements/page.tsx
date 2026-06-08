"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Plus, Sparkles, ChevronRight, BookOpen, User, Mountain, Package } from "lucide-react";
import { elementsApi, scriptsApi, useApi } from "@/lib/api";
import { adaptElements, adaptScriptMetadata, adaptScriptEpisode } from "@/lib/adapters";
import { ElementType, ElementItem, ScriptData } from "@/mocks/types";
import { ScriptOverlay } from "@/components/script-overlay";
import { CharacterEditor } from "@/components/character-editor";
import { SceneEditor } from "@/components/scene-editor";
import { ScriptImportOverlay } from "@/components/script-import-overlay";
import { ExtractionProgressOverlay } from "@/components/extraction-progress-overlay";
import { ScriptAnalysisProgressOverlay } from "@/components/script-analysis-progress-overlay";
import { ScriptAnalysisResultOverlay } from "@/components/script-analysis-result-overlay";
import { ScriptSummary } from "@/components/script-summary";
import { CreateElementModal } from "@/components/elements/create-element-modal";
import { DeleteConfirmModal } from "@/components/elements/delete-confirm-modal";
import { ElementGrid } from "@/components/elements/element-grid";

const typeTabs: { key: ElementType; label: string }[] = [
  { key: "character", label: "角色" },
  { key: "scene", label: "场景" },
  { key: "prop", label: "道具" },
  { key: "audio", label: "音效" },
];

const typeLabels: Record<string, string> = { character: "角色", scene: "场景", prop: "道具", audio: "音效" };

export default function ElementsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("character");
  const [scriptOpen, setScriptOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scriptImportOpen, setScriptImportOpen] = useState(false);
  const [analysisProgressOpen, setAnalysisProgressOpen] = useState(false);
  const [extractionProgressOpen, setExtractionProgressOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reExtractOpen, setReExtractOpen] = useState(false);

  const [localElements, setLocalElements] = useState<ElementItem[]>([]);

  const { data: roles, isLoading, refetch: refetchRoles } = useApi(
    () => elementsApi.fetchElements(params.id),
    [params.id],
  );

  useEffect(() => {
    if (roles) {
      setLocalElements(adaptElements(roles));
    }
  }, [roles]);

  const mockExtractionResults = [
    { type: "character" as const, name: "秦羽" }, { type: "character" as const, name: "姜立" },
    { type: "character" as const, name: "侯费" }, { type: "character" as const, name: "黑羽" },
    { type: "scene" as const, name: "秦村黄昏" }, { type: "scene" as const, name: "九剑仙府外景" },
    { type: "scene" as const, name: "潜龙大陆山顶" }, { type: "prop" as const, name: "流星泪" },
    { type: "prop" as const, name: "黑炎君之戒" },
  ];

  const handleExtractionConfirm = useCallback(() => {
    const newElements: ElementItem[] = mockExtractionResults.map((item, idx) => ({
      id: `el-extracted-${Date.now()}-${idx}`, projectId: params.id, type: item.type,
      name: item.name, thumbnailUrl: "", tags: [], createdAt: new Date().toISOString().slice(0, 10),
    }));
    setLocalElements((prev) => [...prev, ...newElements]);
  }, [params.id]);

  useEffect(() => {
    const openOverlay = analysisProgressOpen ? "script-analysis-progress"
      : extractionProgressOpen ? "extraction-progress"
      : reExtractOpen ? "script-analysis-result"
      : createOpen ? "create-element" : null;
    sessionStorage.setItem("dev-nav-state", JSON.stringify({ tab: activeTab, overlay: openOverlay }));
  }, [activeTab, analysisProgressOpen, extractionProgressOpen, reExtractOpen, createOpen]);

  function deleteElement(id: string) { setLocalElements((prev) => prev.filter((e) => e.id !== id)); setDeleteConfirmId(null); setMoreMenuId(null); }
  function handleCreate() {
    if (!createName.trim()) return;
    setLocalElements((prev) => [...prev, {
      id: `el-${Date.now()}`, projectId: params.id, type: activeTab as ElementType,
      name: createName.trim(), thumbnailUrl: "", tags: [], createdAt: new Date().toISOString().slice(0, 10),
    }]);
    setCreateName(""); setCreateOpen(false);
  }

  const { data: projectScript, isLoading: scriptLoading } = useApi(
    () => scriptsApi.fetchProjectScript(params.id),
    [params.id],
  );
  const script: ScriptData | null = projectScript ? {
    projectId: params.id,
    rawContent: projectScript.content.script ?? null,
    metadata: projectScript.content.script ? adaptScriptMetadata(projectScript.content, projectScript.chapters) : null,
    episodes: projectScript.content.script ? projectScript.chapters.map(adaptScriptEpisode) : null,
    lastEditedBy: projectScript.content.producerName ?? null,
    lastEditedAt: projectScript.content.updatedTime ?? null,
  } : null;
  const hasScript = script?.metadata != null;
  const visibleElements = localElements.filter((e) => e.type !== "script");
  const filtered = visibleElements.filter((e) => {
    if (e.type !== activeTab) return false;
    if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  const isEmpty = visibleElements.length === 0;

  return (
    <div className="flex flex-col h-full">
      {!isEmpty && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.12]">
          <div className="flex items-center gap-1">
            <div className="flex gap-1 p-0.5 rounded-full bg-white/[0.08]">
              {typeTabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 h-7 rounded-full text-[13px] transition-all duration-200 flex items-center ${activeTab === tab.key ? "bg-white/10 text-white" : "text-[#b8b8b8] hover:text-white"}`}>{tab.label}</button>
              ))}
            </div>
            {hasScript && (
              <>
                <div className="w-px h-5 bg-white/[0.10] mx-1" />
                <button onClick={() => setScriptOpen(true)} className="h-8 px-3 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                  <BookOpen size={14} strokeWidth={1.5} />查看剧本
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {searchOpen ? (
              <div className="h-8 px-3 rounded-full bg-[#2b2b2b] border border-white/[0.14] flex items-center gap-2">
                <Search size={14} strokeWidth={1.5} className="text-[#a3a3a3] shrink-0" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索元素..." autoFocus
                  className="bg-transparent text-[12px] text-white placeholder:text-[#a3a3a3] outline-none w-32"
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  onKeyDown={(e) => { if (e.key === "Escape") { setSearchQuery(""); setSearchOpen(false); } }}
                />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="h-8 px-3 rounded-full bg-[#2b2b2b] flex items-center gap-2 text-[12px] text-[#a3a3a3] hover:text-[#b8b8b8] transition-colors duration-200">
                <Search size={14} strokeWidth={1.5} />搜索元素...
              </button>
            )}
            <button onClick={() => setReExtractOpen(true)} className="h-8 px-3 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
              <Sparkles size={14} strokeWidth={1.5} />重新提取
            </button>
            <button onClick={() => setCreateOpen(true)} className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200">
              <Plus size={14} strokeWidth={1.5} />添加{typeLabels[activeTab]}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6" onClick={() => setMoreMenuId(null)}>
        {isLoading || scriptLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-[#202020] animate-pulse aspect-[9/16]" />
            ))}
          </div>
        ) : isEmpty && !hasScript ? (
          <EmptyStateWithScript onImportScript={() => setScriptImportOpen(true)} onCreateElement={() => setCreateOpen(true)} />
        ) : isEmpty && hasScript ? (
          <ScriptAnalysisView script={script} onViewScript={() => setScriptOpen(true)} onEditScript={() => setScriptImportOpen(true)} onExtract={() => setExtractionProgressOpen(true)} onCreateElement={() => setCreateOpen(true)} />
        ) : !isEmpty && filtered.length === 0 && searchQuery ? (
          <SearchEmptyState searchQuery={searchQuery} typeLabel={typeLabels[activeTab]} />
        ) : !isEmpty && filtered.length === 0 ? (
          <TabEmptyState activeTab={activeTab as ElementType} typeLabel={typeLabels[activeTab]} onCreate={() => setCreateOpen(true)} />
        ) : (
          <ElementGrid elements={filtered} activeTab={activeTab as ElementType} moreMenuId={moreMenuId}
            onSetMoreMenuId={setMoreMenuId} onEditCharacter={(id) => setEditingCharacterId(id)} onEditScene={(id) => setEditingSceneId(id)}
            onDeleteRequest={(id) => setDeleteConfirmId(id)} />
        )}
      </div>

      <CreateElementModal open={createOpen} activeTab={activeTab as ElementType} name={createName} setName={setCreateName}
        onClose={() => { setCreateOpen(false); setCreateName(""); }} onConfirm={handleCreate} />
      <ScriptOverlay open={scriptOpen} onClose={() => setScriptOpen(false)} script={script} />
      <CharacterEditor open={editingCharacterId !== null} onClose={() => setEditingCharacterId(null)} projectId={params.id} characterId={editingCharacterId ?? ""} roles={roles ?? []} onRefresh={refetchRoles} />
      <SceneEditor open={editingSceneId !== null} onClose={() => setEditingSceneId(null)} projectId={params.id} sceneId={editingSceneId ?? ""} roles={roles ?? []} />
      <ScriptImportOverlay open={scriptImportOpen} onClose={() => setScriptImportOpen(false)}
        onAnalysisStart={() => { setScriptImportOpen(false); if (!hasScript) { router.push("/project/proj-7/elements"); } else { setAnalysisProgressOpen(true); } }} />
      <ScriptAnalysisProgressOverlay open={analysisProgressOpen} onCancel={() => setAnalysisProgressOpen(false)} onComplete={() => setAnalysisProgressOpen(false)} />
      <ScriptAnalysisResultOverlay open={reExtractOpen} onClose={() => setReExtractOpen(false)}
        onStartExtraction={() => { setReExtractOpen(false); setExtractionProgressOpen(true); }}
        metadata={script?.metadata ?? null}
        episodes={script?.episodes ?? null}
        warning="重新提取将覆盖当前元素库中的所有已有元素，此操作无法撤销。" />
      <ExtractionProgressOverlay open={extractionProgressOpen} onCancel={() => setExtractionProgressOpen(false)}
        onComplete={() => { setExtractionProgressOpen(false); handleExtractionConfirm(); }} />
      <DeleteConfirmModal open={deleteConfirmId !== null} onConfirm={() => deleteElement(deleteConfirmId!)} onCancel={() => setDeleteConfirmId(null)} />
    </div>
  );
}

function EmptyStateWithScript({ onImportScript, onCreateElement }: { onImportScript: () => void; onCreateElement: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.08] flex items-center justify-center mb-5"><Sparkles size={28} strokeWidth={1.5} className="text-[#a3a3a3]" /></div>
          <h2 className="text-lg font-medium mb-2">开始构建元素库</h2>
          <p className="text-[14px] text-[#a3a3a3] leading-[1.7]">从剧本自动提取角色、场景、道具等元素，或手动逐个添加。</p>
        </div>
        <div className="space-y-3">
          <button onClick={onImportScript} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#00CAE0]/20 bg-[#00CAE0]/[0.04] text-left hover:shadow-[0_0_0_1px_rgba(0,202,224,0.3)] transition-shadow duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-[#00CAE0]/15 flex items-center justify-center shrink-0"><Sparkles size={18} strokeWidth={1.5} className="text-[#00CAE0]" /></div>
            <div className="flex-1 min-w-0"><p className="text-[14px] font-medium">从剧本提取元素</p><p className="text-[12px] text-[#a3a3a3] mt-0.5">粘贴或上传剧本，AI 自动分析提取</p></div>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[#00CAE0]/40 group-hover:text-[#00CAE0] transition-colors duration-200" />
          </button>
          <button onClick={onCreateElement} className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.12] bg-[#181818] text-left hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-white/[0.10] flex items-center justify-center shrink-0"><Plus size={18} strokeWidth={1.5} className="text-[#b8b8b8]" /></div>
            <div className="flex-1 min-w-0"><p className="text-[14px] font-medium">手动添加</p><p className="text-[12px] text-[#a3a3a3] mt-0.5">逐个添加角色、场景等元素</p></div>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[#888] group-hover:text-[#b8b8b8] transition-colors duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScriptAnalysisView({ script, onViewScript, onEditScript, onExtract, onCreateElement }: { script: ScriptData; onViewScript: () => void; onEditScript: () => void; onExtract: () => void; onCreateElement: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-6 pb-3">
        <div className="max-w-lg mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">剧本分析</h2>
            <div className="flex items-center gap-2">
              <button onClick={onViewScript} className="h-7 px-3 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"><BookOpen size={12} strokeWidth={1.5} />查看完整剧本</button>
              <button onClick={onEditScript} className="h-7 px-3 rounded-full text-[12px] text-[#a3a3a3] hover:text-[#b8b8b8] transition-colors duration-200">修改剧本</button>
            </div>
          </div>
          {script.metadata && script.episodes && (<ScriptSummary metadata={script.metadata} episodes={script.episodes} />)}
        </div>
      </div>
      <div className="shrink-0 border-t border-white/[0.12] bg-[#0a0a0a] px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-end gap-2">
          <button onClick={onCreateElement} className="h-9 px-4 rounded-full bg-white/[0.10] text-[13px] text-[#b8b8b8] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">跳过提取，手动添加</button>
          <button onClick={onExtract} className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200"><Sparkles size={14} strokeWidth={1.5} />提取元素</button>
        </div>
      </div>
    </div>
  );
}

function SearchEmptyState({ searchQuery, typeLabel }: { searchQuery: string; typeLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center mb-4"><Search size={24} strokeWidth={1.5} className="text-[#888]" /></div>
      <p className="text-[15px] text-[#b8b8b8] mb-1">未找到匹配的元素</p>
      <p className="text-[13px] text-[#a3a3a3]">没有包含「{searchQuery}」的{typeLabel}</p>
    </div>
  );
}

function TabEmptyState({ activeTab, typeLabel, onCreate }: { activeTab: ElementType; typeLabel: string; onCreate: () => void }) {
  const icon = activeTab === "character" ? User : activeTab === "scene" ? Mountain : activeTab === "prop" ? Package : Sparkles;
  const Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center mb-4"><Icon size={24} strokeWidth={1.5} className="text-[#888]" /></div>
      <p className="text-[15px] text-[#b8b8b8] mb-1">暂无{typeLabel}</p>
      <p className="text-[13px] text-[#a3a3a3] mb-5">添加{typeLabel}素材丰富项目内容</p>
      <button onClick={onCreate} className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200"><Plus size={14} strokeWidth={1.5} />添加{typeLabel}</button>
    </div>
  );
}
