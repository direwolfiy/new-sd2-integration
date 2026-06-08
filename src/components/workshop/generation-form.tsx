"use client";

import { useState, useRef, useCallback } from "react";
import {
  Image,
  Film,
  Frame,
  Crop,
  Clock,
  Volume2,
  Upload,
  Library,
  Sparkles,
  X,
  Plus,
  Search,
  Send,
  Check,
} from "lucide-react";
import { assets } from "@/mocks/assets";
import type { GenTask, ImageSource, ReferenceImage } from "./types";
import { MAX_REFERENCES } from "./types";

const sourceTabs: { key: ImageSource; label: string; icon: typeof Upload }[] = [
  { key: "asset", label: "资产库", icon: Library },
  { key: "local", label: "本地上传", icon: Upload },
  { key: "history", label: "历史记录", icon: Clock },
  { key: "inspiration", label: "灵感库", icon: Sparkles },
];

const sourceIcons: Record<ImageSource, typeof Upload> = {
  local: Upload,
  asset: Library,
  inspiration: Sparkles,
  history: Clock,
};

interface GenerationFormProps {
  tasks: GenTask[];
  references: ReferenceImage[];
  setReferences: React.Dispatch<React.SetStateAction<ReferenceImage[]>>;
}

export function GenerationForm({ tasks, references, setReferences }: GenerationFormProps) {
  const [type, setType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [prompt, setPrompt] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ImageSource>("asset");
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set());
  const [refSearch, setRefSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingIds = new Set(references.map((r) => r.id));
  const imageAssets = assets.filter((a) => a.type === "image");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED" && t.resultCount > 0);

  const addReference = useCallback((ref: ReferenceImage) => {
    setReferences((prev) => {
      if (prev.length >= MAX_REFERENCES || prev.some((r) => r.id === ref.id)) return prev;
      return [...prev, ref];
    });
  }, [setReferences]);

  const removeReference = useCallback((id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  }, [setReferences]);

  const handleLocalFiles = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          addReference({
            id: `local-${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            source: "local",
            thumbnailUrl: e.target?.result as string,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    },
    [addReference],
  );

  function toggleTempSelect(id: string) {
    setTempSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function closePicker() {
    setPickerOpen(false);
    setTempSelected(new Set());
    setRefSearch("");
  }

  function confirmPicker() {
    for (const id of tempSelected) {
      const asset = imageAssets.find((a) => a.id === id);
      if (asset) {
        addReference({ id: asset.id, source: "asset", thumbnailUrl: asset.thumbnailUrl, name: asset.name });
        continue;
      }
      const historyId = id.replace("history-", "");
      const task = tasks.find((t) => t.id === historyId);
      if (task) {
        addReference({ id, source: "history", thumbnailUrl: "", name: task.prompt.slice(0, 40) });
      }
    }
    closePicker();
  }

  const filteredAssets = refSearch
    ? imageAssets.filter((a) => a.name.toLowerCase().includes(refSearch.toLowerCase()))
    : imageAssets;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-32px)] max-w-3xl">
        <div className="rounded-xl border border-white/[0.14] bg-[#1c1c1c]/95 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <ReferenceBar
            references={references}
            removeReference={removeReference}
            onAddClick={() => { setActiveTab("asset"); setTempSelected(new Set()); setRefSearch(""); setPickerOpen(true); }}
            sourceIcons={sourceIcons}
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想生成的内容..."
            rows={2}
            className="w-full bg-transparent text-[14px] text-white placeholder:text-white/25 resize-none outline-none leading-[1.7]"
          />
          <Toolbar type={type} onTypeChange={setType} promptLength={prompt.length} />
        </div>
      </div>

      {pickerOpen && (
        <ReferencePicker
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tempSelected={tempSelected}
          toggleTempSelect={toggleTempSelect}
          existingIds={existingIds}
          filteredAssets={filteredAssets}
          completedTasks={completedTasks}
          refSearch={refSearch}
          setRefSearch={setRefSearch}
          fileInputRef={fileInputRef}
          handleLocalFiles={(files) => { handleLocalFiles(files); closePicker(); }}
          closePicker={closePicker}
          confirmPicker={confirmPicker}
          sourceTabs={sourceTabs}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) {
            handleLocalFiles(e.target.files);
            closePicker();
          }
          e.target.value = "";
        }}
      />
    </>
  );
}

function ReferenceBar({
  references,
  removeReference,
  onAddClick,
  sourceIcons,
}: {
  references: ReferenceImage[];
  removeReference: (id: string) => void;
  onAddClick: () => void;
  sourceIcons: Record<ImageSource, typeof Upload>;
}) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${references.length > 0 ? "pb-3 mb-3 border-b border-white/[0.12]" : "mb-3"}`}>
      {references.map((ref) => {
        const SourceIcon = sourceIcons[ref.source];
        return (
          <div key={ref.id} className="relative group shrink-0" title={ref.name}>
            <div className="w-20 h-20 rounded-lg bg-[#2b2b2b] border border-white/[0.12] flex items-center justify-center overflow-hidden relative">
              {ref.thumbnailUrl ? (
                <img src={ref.thumbnailUrl} alt={ref.name} className="w-full h-full object-cover" />
              ) : (
                <Image size={16} strokeWidth={1.5} className="text-[#a3a3a3]" />
              )}
              <div className="absolute bottom-0.5 left-0.5 w-4 h-4 rounded bg-black/60 flex items-center justify-center">
                <SourceIcon size={9} strokeWidth={2} className="text-white/70" />
              </div>
            </div>
            <button
              onClick={() => removeReference(ref.id)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1c1c1c] border border-white/[0.14] flex items-center justify-center text-[#a3a3a3] opacity-0 group-hover:opacity-100 hover:text-white transition-all duration-200"
            >
              <X size={10} strokeWidth={1.5} />
            </button>
          </div>
        );
      })}
      {references.length < MAX_REFERENCES && (
        <button
          onClick={onAddClick}
          className="w-20 h-20 shrink-0 rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center text-[#a3a3a3] hover:border-white/[0.2] hover:text-[#b8b8b8] transition-colors duration-200"
        >
          <Plus size={18} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

function Toolbar({ type, onTypeChange, promptLength }: { type: "IMAGE" | "VIDEO"; onTypeChange: (t: "IMAGE" | "VIDEO") => void; promptLength: number }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex items-center gap-1 flex-1 flex-wrap">
        <button onClick={() => onTypeChange("IMAGE")} className={`h-7 px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors duration-200 ${type === "IMAGE" ? "bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] border border-[rgba(0,202,224,0.15)]" : "bg-white/[0.10] text-[#b8b8b8] border border-transparent hover:bg-white/[0.1]"}`}>
          <Image size={13} strokeWidth={1.5} />图片
        </button>
        <button onClick={() => onTypeChange("VIDEO")} className={`h-7 px-2.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors duration-200 ${type === "VIDEO" ? "bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] border border-[rgba(0,202,224,0.15)]" : "bg-white/[0.10] text-[#b8b8b8] border border-transparent hover:bg-white/[0.1]"}`}>
          <Film size={13} strokeWidth={1.5} />视频
        </button>
        <div className="w-px h-4 bg-white/[0.10] mx-1" />
        <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] transition-colors duration-200">
          {type === "IMAGE" ? "NanoBanana-2" : "Seedance 2.0"}
        </button>
        {type === "IMAGE" ? (
          <>
            <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] transition-colors duration-200"><Frame size={13} strokeWidth={1.5} />2K</button>
            <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] transition-colors duration-200"><Crop size={13} strokeWidth={1.5} />16:9</button>
          </>
        ) : (
          <>
            <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] transition-colors duration-200"><Clock size={13} strokeWidth={1.5} />5秒</button>
            <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] transition-colors duration-200"><Crop size={13} strokeWidth={1.5} />16:9</button>
            <button className="h-7 px-2.5 rounded-full bg-white/[0.10] text-[12px] text-[#b8b8b8] flex items-center gap-1 hover:bg-white/[0.1] transition-colors duration-200"><Volume2 size={13} strokeWidth={1.5} />有声</button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-[#a3a3a3]">{promptLength}/4000</span>
        <button disabled={!promptLength} className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">
          <Send size={13} strokeWidth={2} />生成
        </button>
      </div>
    </div>
  );
}

function ReferencePicker({
  activeTab, setActiveTab, tempSelected, toggleTempSelect, existingIds,
  filteredAssets, completedTasks, refSearch, setRefSearch,
  fileInputRef, handleLocalFiles, closePicker, confirmPicker, sourceTabs,
}: {
  activeTab: ImageSource;
  setActiveTab: (t: ImageSource) => void;
  tempSelected: Set<string>;
  toggleTempSelect: (id: string) => void;
  existingIds: Set<string>;
  filteredAssets: typeof assets;
  completedTasks: GenTask[];
  refSearch: string;
  setRefSearch: (s: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleLocalFiles: (files: FileList) => void;
  closePicker: () => void;
  confirmPicker: () => void;
  sourceTabs: { key: ImageSource; label: string; icon: typeof Upload }[];
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[640px] h-[75vh] rounded-xl border border-white/[0.14] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.12] shrink-0">
          <h3 className="text-[15px] font-medium">选择参考图</h3>
          <button onClick={closePicker} className="w-7 h-7 rounded-full flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/[0.10] transition-colors duration-200">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex gap-1 p-1 mx-5 mt-4 rounded-full bg-white/[0.10] shrink-0">
          {sourceTabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setActiveTab(key); setRefSearch(""); }} className={`flex-1 h-8 rounded-full text-[12px] flex items-center justify-center gap-1.5 transition-all duration-200 ${activeTab === key ? "bg-white/10 text-white" : "text-[#b8b8b8] hover:text-white"}`}>
              <Icon size={13} strokeWidth={1.5} />{label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {activeTab === "asset" && (
            <>
              <div className="flex items-center h-8 px-3 rounded-full bg-[#2b2b2b] gap-2 text-[12px] text-[#a3a3a3] mb-4">
                <Search size={14} strokeWidth={1.5} />
                <input value={refSearch} onChange={(e) => setRefSearch(e.target.value)} placeholder="搜索资产..." className="flex-1 bg-transparent outline-none text-[12px] text-white placeholder:text-[#a3a3a3]" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {filteredAssets.map((asset) => {
                  const selected = tempSelected.has(asset.id);
                  const attached = existingIds.has(asset.id);
                  return (
                    <button key={asset.id} onClick={() => !attached && toggleTempSelect(asset.id)} className={`rounded-lg overflow-hidden border transition-all duration-200 ${attached ? "border-[rgba(0,202,224,0.2)] opacity-50 cursor-default" : selected ? "border-[rgba(0,202,224,0.4)] ring-1 ring-[rgba(0,202,224,0.3)]" : "border-white/[0.12] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"}`}>
                      <div className="aspect-square bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center relative">
                        <Image size={20} strokeWidth={1} className="text-white/[0.06]" />
                        {(selected || attached) && (
                          <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${attached ? "bg-[rgba(0,202,224,0.2)]" : "bg-[#00CAE0]"}`}>
                            <Check size={10} strokeWidth={2} className={attached ? "text-[#00CAE0]" : "text-black"} />
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-[#181818]">
                        <p className="text-[11px] text-[#ccc] truncate">{asset.name}</p>
                        <p className="text-[10px] text-[#b8b8b8] mt-0.5">{asset.sourceProject}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "local" && (
            <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) { handleLocalFiles(e.dataTransfer.files); closePicker(); } }} className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/[0.1] rounded-xl hover:border-white/[0.2] transition-colors duration-200 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center mb-4"><Upload size={24} strokeWidth={1.5} className="text-[#a3a3a3]" /></div>
              <p className="text-[14px] text-[#b8b8b8] mb-1">点击或拖拽图片到此区域</p>
              <p className="text-[12px] text-[#b8b8b8]">支持 PNG、JPG、WebP，单张最大 10MB</p>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex flex-col gap-2">
              {completedTasks.map((task) => {
                const refId = `history-${task.id}`;
                const selected = tempSelected.has(refId);
                const attached = existingIds.has(refId);
                return (
                  <button key={task.id} onClick={() => !attached && toggleTempSelect(refId)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${attached ? "bg-[rgba(0,202,224,0.05)] border border-[rgba(0,202,224,0.15)] opacity-50 cursor-default" : selected ? "bg-[rgba(0,202,224,0.05)] border border-[rgba(0,202,224,0.2)]" : "border border-white/[0.12] hover:border-white/[0.12]"}`}>
                    <div className="w-12 h-12 rounded-lg bg-[#2b2b2b] border border-white/[0.12] flex items-center justify-center shrink-0">
                      {task.type === "VIDEO" ? <Film size={16} strokeWidth={1.5} className="text-[#a3a3a3]" /> : <Image size={16} strokeWidth={1.5} className="text-[#a3a3a3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] leading-[1.5] truncate">{task.prompt}</p>
                      <p className="text-[11px] text-[#a3a3a3] mt-0.5">{task.createdAt} · {task.model}</p>
                    </div>
                    {selected || attached ? (
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${attached ? "bg-[rgba(0,202,224,0.2)]" : "bg-[#00CAE0]"}`}>
                        <Check size={12} strokeWidth={2} className={attached ? "text-[#00CAE0]" : "text-black"} />
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#888] shrink-0">{task.resultCount} 张</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "inspiration" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center mb-4"><Sparkles size={24} strokeWidth={1.5} className="text-[#888]" /></div>
              <p className="text-[14px] text-[#a3a3a3] mb-1">灵感库即将上线</p>
              <p className="text-[12px] text-[#b8b8b8]">精选风格参考，助你快速找到创作方向</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.12] shrink-0">
          <span className="text-[12px] text-[#a3a3a3]">{tempSelected.size > 0 ? `已选择 ${tempSelected.size} 张` : "点击图片选择"}</span>
          <div className="flex items-center gap-2">
            <button onClick={closePicker} className="h-9 px-4 rounded-full bg-white/[0.10] text-[13px] text-[#b8b8b8] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">取消</button>
            <button onClick={confirmPicker} disabled={tempSelected.size === 0} className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none">
              <Plus size={14} strokeWidth={2} />添加{tempSelected.size > 0 ? ` ${tempSelected.size} 张` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
