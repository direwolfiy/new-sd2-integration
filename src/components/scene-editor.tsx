"use client";

import { useState, useEffect } from "react";
import { X, Mountain } from "lucide-react";
import type { SceneRoleItem } from "@/lib/api/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sceneId: string;
  roles: SceneRoleItem[];
}

export function SceneEditor({ open, onClose, projectId, sceneId, roles }: Props) {
  const scenes = roles.filter((r) => r.template_type === "SCENE");
  const [selectedId, setSelectedId] = useState(sceneId);

  useEffect(() => { setSelectedId(sceneId); }, [sceneId]);

  const selected = scenes.find((s) => String(s.id) === selectedId);
  if (!open || !selected) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-white/[0.12]">
        <span className="text-[15px] font-medium">场景设计</span>
        <button onClick={onClose} className="h-8 px-3 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
          关闭 <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <ScrollArea className="h-full w-[160px] shrink-0 border-r border-white/[0.12]">
          <nav className="p-3">
            <div className="flex flex-col gap-3">
              {scenes.map((scene) => (
                <button key={scene.id} onClick={() => setSelectedId(String(scene.id))} className={`shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${String(scene.id) === selectedId ? "ring-2 ring-white/20 bg-white/[0.08]" : "opacity-50 hover:opacity-80"}`}>
                  <div className="relative aspect-video bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center">
                    {scene.cover_image ? (
                      <img src={scene.cover_image} alt={scene.template_name ?? ""} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Mountain size={20} strokeWidth={1} className="text-white/[0.06]" />
                    )}
                  </div>
                  <p className="text-[11px] text-center py-1.5 truncate px-1.5">{scene.template_name}</p>
                </button>
              ))}
            </div>
          </nav>
        </ScrollArea>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-white/[0.12] p-4">
              <div className="flex items-start gap-4">
                {selected.cover_image && (
                  <div className="w-40 h-24 rounded-lg overflow-hidden shrink-0">
                    <img src={selected.cover_image} alt={selected.template_name ?? ""} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-medium">{selected.template_name}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    {selected.template_category && <span className="px-2 py-0.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8]">{selected.template_category}</span>}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-[12px] text-[#a3a3a3]">场景描述</span>
                <p className="text-[13px] text-[#ccc] leading-[1.7] mt-0.5">{selected.description || "暂无"}</p>
              </div>
            </div>

            {selected.appearance && typeof selected.appearance === "object" && (
              <div className="rounded-xl border border-white/[0.12] p-4">
                <h3 className="text-[14px] font-medium mb-3">场景设定</h3>
                <pre className="text-[12px] text-[#b8b8b8] leading-[1.7] whitespace-pre-wrap break-words">{JSON.stringify(selected.appearance, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
