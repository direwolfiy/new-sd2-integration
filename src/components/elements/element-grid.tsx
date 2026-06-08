"use client";

import { User, Mountain, Package, Sparkles, MoreHorizontal, Trash2 } from "lucide-react";
import type { ElementItem, ElementType } from "@/mocks/types";

interface ElementGridProps {
  elements: ElementItem[];
  activeTab: ElementType;
  moreMenuId: string | null;
  onSetMoreMenuId: (id: string | null) => void;
  onEditCharacter: (id: string) => void;
  onEditScene: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function ElementGrid({ elements, activeTab, moreMenuId, onSetMoreMenuId, onEditCharacter, onEditScene, onDeleteRequest }: ElementGridProps) {
  const gridCls = activeTab === "scene"
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    : activeTab === "audio"
    ? ""
    : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3";

  return (
    <div className={activeTab === "audio" ? "space-y-1.5" : gridCls}>
      {elements.map((element) => {
        if (activeTab === "audio") return <AudioRow key={element.id} element={element} moreMenuId={moreMenuId} onSetMoreMenuId={onSetMoreMenuId} onDeleteRequest={onDeleteRequest} />;
        if (activeTab === "character") return <CharacterCard key={element.id} element={element} moreMenuId={moreMenuId} onSetMoreMenuId={onSetMoreMenuId} onEdit={onEditCharacter} onDeleteRequest={onDeleteRequest} />;
        if (activeTab === "scene") return <SceneCard key={element.id} element={element} moreMenuId={moreMenuId} onSetMoreMenuId={onSetMoreMenuId} onEdit={onEditScene} onDeleteRequest={onDeleteRequest} />;
        return <PropCard key={element.id} element={element} moreMenuId={moreMenuId} onSetMoreMenuId={onSetMoreMenuId} onDeleteRequest={onDeleteRequest} />;
      })}
    </div>
  );
}

function MoreMenu({ moreMenuId, elementId, onDelete }: { moreMenuId: string | null; elementId: string; onDelete: () => void }) {
  if (moreMenuId !== elementId) return null;
  return (
    <div className="absolute right-0 top-full mt-1 w-28 py-1 rounded-lg border border-white/[0.14] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10">
      <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#ef4444] hover:bg-white/[0.10] transition-colors duration-200">
        <Trash2 size={14} strokeWidth={1.5} />删除
      </button>
    </div>
  );
}

function CharacterCard({ element, moreMenuId, onSetMoreMenuId, onEdit, onDeleteRequest }: { element: ElementItem; moreMenuId: string | null; onSetMoreMenuId: (id: string | null) => void; onEdit: (id: string) => void; onDeleteRequest: (id: string) => void }) {
  return (
    <div onClick={() => { if (moreMenuId !== element.id) onEdit(element.id); }} className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${moreMenuId === element.id ? "z-10" : ""}`}>
      <div className="relative aspect-[9/16] bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
        {element.thumbnailUrl ? (
          <img src={element.thumbnailUrl} alt={element.name} className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <User size={32} strokeWidth={1} className="text-white/[0.06]" />
        )}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2.5 pt-12">
          <p className="text-xs font-medium text-white truncate">{element.name}</p>
          {element.variants && element.variants.length > 1 && (<p className="mt-0.5 text-[10px] text-white/60">{element.variants.length} 个形象</p>)}
        </div>
        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onSetMoreMenuId(moreMenuId === element.id ? null : element.id)} className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/60 transition-all duration-200">
            <MoreHorizontal size={14} strokeWidth={1.5} />
          </button>
          <MoreMenu moreMenuId={moreMenuId} elementId={element.id} onDelete={() => onDeleteRequest(element.id)} />
        </div>
      </div>
    </div>
  );
}

function SceneCard({ element, moreMenuId, onSetMoreMenuId, onEdit, onDeleteRequest }: { element: ElementItem; moreMenuId: string | null; onSetMoreMenuId: (id: string | null) => void; onEdit: (id: string) => void; onDeleteRequest: (id: string) => void }) {
  return (
    <div onClick={() => { if (moreMenuId !== element.id) onEdit(element.id); }} className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${moreMenuId === element.id ? "z-10" : ""}`}>
      <div className="relative aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
        {element.thumbnailUrl ? (
          <img src={element.thumbnailUrl} alt={element.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Mountain size={32} strokeWidth={1} className="text-white/[0.06]" />
        )}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-14">
          <p className="text-sm font-medium text-white truncate">{element.name}</p>
        </div>
        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onSetMoreMenuId(moreMenuId === element.id ? null : element.id)} className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/60 transition-all duration-200">
            <MoreHorizontal size={14} strokeWidth={1.5} />
          </button>
          <MoreMenu moreMenuId={moreMenuId} elementId={element.id} onDelete={() => onDeleteRequest(element.id)} />
        </div>
      </div>
    </div>
  );
}

function PropCard({ element, moreMenuId, onSetMoreMenuId, onDeleteRequest }: { element: ElementItem; moreMenuId: string | null; onSetMoreMenuId: (id: string | null) => void; onDeleteRequest: (id: string) => void }) {
  return (
    <div className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${moreMenuId === element.id ? "z-10" : ""}`}>
      <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
        {element.thumbnailUrl ? (
          <img src={element.thumbnailUrl} alt={element.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Package size={32} strokeWidth={1} className="text-white/[0.06]" />
        )}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2.5 pt-8">
          <p className="text-xs font-medium text-white truncate">{element.name}</p>
          {element.tags.length > 0 && (<p className="mt-0.5 text-[10px] text-white/60 truncate">{element.tags.join(" · ")}</p>)}
        </div>
        <div className="absolute top-2 right-2 z-20">
          <button onClick={() => onSetMoreMenuId(moreMenuId === element.id ? null : element.id)} className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/60 transition-all duration-200">
            <MoreHorizontal size={14} strokeWidth={1.5} />
          </button>
          <MoreMenu moreMenuId={moreMenuId} elementId={element.id} onDelete={() => onDeleteRequest(element.id)} />
        </div>
      </div>
    </div>
  );
}

function AudioRow({ element, moreMenuId, onSetMoreMenuId, onDeleteRequest }: { element: ElementItem; moreMenuId: string | null; onSetMoreMenuId: (id: string | null) => void; onDeleteRequest: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.12] bg-[#181818] cursor-pointer hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-shadow duration-200">
      <div className="w-10 h-10 rounded-lg bg-[#2b2b2b] flex items-center justify-center shrink-0"><Sparkles size={16} strokeWidth={1.5} className="text-[#a3a3a3]" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{element.name}</p>
        <p className="text-[12px] text-[#a3a3a3] mt-0.5">{element.tags.join(" · ")}</p>
      </div>
      <div className="relative shrink-0">
        <button onClick={() => onSetMoreMenuId(moreMenuId === element.id ? null : element.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#a3a3a3] opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/[0.10] transition-all duration-200">
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
        <MoreMenu moreMenuId={moreMenuId} elementId={element.id} onDelete={() => onDeleteRequest(element.id)} />
      </div>
    </div>
  );
}
