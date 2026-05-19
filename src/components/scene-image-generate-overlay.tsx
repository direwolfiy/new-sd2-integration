"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Send,
  Image as ImageIcon,
  Clock,
  Check,
  ChevronDown,
  Mountain,
  Upload,
  Library,
  X,
  Search,
  Coins,
} from "lucide-react";
import { calcImageCost } from "@/lib/pricing";

interface GenerationImage {
  id: string;
  name: string;
  url: string | null;
}

interface GenerationRecord {
  id: string;
  prompt: string;
  model: string;
  ratio: string;
  createdAt: string;
  images: GenerationImage[];
}

// TODO: [mock] replace with API call
const mockHistory: GenerationRecord[] = [
  { id: "sgen-1", prompt: "夕阳下的偏远山村，三面环山，小溪穿村而过，炊烟袅袅，金色余晖洒满屋顶", model: "SDXL", ratio: "16:9", createdAt: "2025-12-11 16:20", images: [{ id: "sgi-1a", name: "图片 1", url: null }] },
  { id: "sgen-2", prompt: "星空下的宁静村庄，灯火点点，远处山峦剪影，银河横跨天际", model: "Flux Pro", ratio: "16:9", createdAt: "2025-12-11 15:45", images: [{ id: "sgi-2a", name: "图片 2", url: null }] },
  { id: "sgen-3", prompt: "悬浮于云海之上的仙家府邸，九把巨剑插于山巅，金光万道", model: "SDXL", ratio: "16:9", createdAt: "2025-12-13 09:30", images: [{ id: "sgi-3a", name: "图片 3", url: null }] },
];

// TODO: [mock] replace with API call
const mockLibrary = [
  { id: "slib-1", name: "秦村黄昏-全景", source: "项目元素" },
  { id: "slib-2", name: "九剑仙府-白天", source: "项目元素" },
  { id: "slib-3", name: "潜龙大陆山顶-日出", source: "项目元素" },
  { id: "slib-4", name: "废弃地铁站", source: "项目元素" },
  { id: "slib-5", name: "古风山村参考-01", source: "平台资源" },
  { id: "slib-6", name: "仙府建筑参考-01", source: "平台资源" },
  { id: "slib-7", name: "云海日出参考", source: "平台资源" },
  { id: "slib-8", name: "废弃建筑氛围参考", source: "平台资源" },
  { id: "slib-9", name: "黄昏天空贴图", source: "平台资源" },
  { id: "slib-10", name: "山脉远景素材", source: "平台资源" },
];

const models = ["SDXL", "Flux Pro", "Midjourney"];
const ratios = ["16:9", "4:3", "21:9", "1:1"];
const counts = ["1 张", "2 张", "4 张"];
const countMap: Record<string, number> = { "1 张": 1, "2 张": 2, "4 张": 4 };

function parseCount(s: string): number {
  return countMap[s] ?? 1;
}

function Dropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="h-7 px-2.5 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
        {value}
        <ChevronDown size={12} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10 min-w-[100px]">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-200 ${opt === value ? "text-white bg-white/[0.06]" : "text-[#999] hover:text-white hover:bg-white/[0.04]"}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  stateName: string;
}

export function SceneImageGenerateOverlay({ open, onClose, stateName }: Props) {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [selectedRatio, setSelectedRatio] = useState(ratios[0]);
  const [selectedCount, setSelectedCount] = useState(counts[2]);
  const [addedImages, setAddedImages] = useState<Set<string>>(new Set());
  const [activeRecordId, setActiveRecordId] = useState<string>(mockHistory[0]?.id ?? "");
  const recordRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Reference image modal
  const [refModalOpen, setRefModalOpen] = useState(false);
  const [refTab, setRefTab] = useState<"library" | "upload">("library");
  const [refSelected, setRefSelected] = useState<Set<string>>(new Set());
  const [refAttached, setRefAttached] = useState<{ id: string; name: string }[]>([]);

  function scrollToRecord(id: string) {
    setActiveRecordId(id);
    recordRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleAdded(imageId: string) {
    setAddedImages((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });
  }

  function toggleRefSelect(id: string) {
    setRefSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmRefSelect() {
    const newRefs = [...refAttached];
    for (const id of refSelected) {
      if (!newRefs.find((r) => r.id === id)) {
        const item = mockLibrary.find((l) => l.id === id);
        if (item) newRefs.push({ id: item.id, name: item.name });
      }
    }
    setRefAttached(newRefs);
    setRefModalOpen(false);
    setRefSelected(new Set());
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0a0a0a] flex flex-col animate-in fade-in duration-150 ease-out">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-5 h-[56px] border-b border-white/[0.06]">
        <button onClick={onClose} className="flex items-center gap-2 text-[13px] text-[#999] hover:text-white transition-colors duration-200 shrink-0">
          <ArrowLeft size={16} strokeWidth={1.5} />
          返回
        </button>
        <div className="w-px h-5 bg-white/[0.06] shrink-0" />
        <span className="text-[14px] font-medium">生成场景图 — {stateName}</span>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0 p-4 gap-4">
        {/* Left — generation panel */}
        <div className="w-[40%] shrink-0 rounded-xl border border-white/[0.06] bg-[#141414] flex flex-col">
          <div className="px-5 pt-5 pb-2 shrink-0">
            <h3 className="text-[15px] font-medium">生成设置</h3>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Reference images */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] shrink-0">
              <p className="text-[12px] text-[#666] mb-2">参考图</p>
              <div className="flex items-center gap-2 flex-wrap">
                {refAttached.map((ref) => (
                  <div key={ref.id} className="relative group">
                    <div className="w-20 h-12 rounded-lg bg-[#262626] border border-white/[0.06] flex items-center justify-center">
                      <ImageIcon size={14} strokeWidth={1.5} className="text-[#444]" />
                    </div>
                    <button
                      onClick={() => setRefAttached((prev) => prev.filter((r) => r.id !== ref.id))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1c1c1c] border border-white/[0.08] flex items-center justify-center text-[#666] opacity-0 group-hover:opacity-100 hover:text-white transition-all duration-200"
                    >
                      <X size={10} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setRefModalOpen(true)}
                  className="w-20 h-12 rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center text-[#666] hover:border-white/[0.2] hover:text-[#999] transition-colors duration-200"
                >
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Prompt */}
            <div className="flex-1 flex flex-col p-4 min-h-0">
              <p className="text-[12px] text-[#666] mb-2 shrink-0">提示词</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的场景图..."
                className="flex-1 w-full bg-[#262626] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-[#ccc] leading-[1.7] placeholder:text-white/25 resize-none outline-none focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] transition-colors duration-200"
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="shrink-0 px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dropdown value={selectedModel} options={models} onChange={setSelectedModel} />
                <Dropdown value={selectedRatio} options={ratios} onChange={setSelectedRatio} />
                <Dropdown value={selectedCount} options={counts} onChange={setSelectedCount} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#666] flex items-center gap-1">
                  <Coins size={12} strokeWidth={1.5} className="text-[#00CAE0]" />
                  {calcImageCost(selectedModel, selectedCount)} 积分
                </span>
                <button className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200">
                  <Send size={14} strokeWidth={2} />
                  生成
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — history */}
        <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#141414] flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0 mr-[56px]">
            <h3 className="text-[15px] font-medium">生成历史</h3>
            <div className="flex items-center gap-1.5">
              <button className="h-7 px-2.5 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                <Upload size={12} strokeWidth={1.5} />
                上传图片
              </button>
              <button className="h-7 px-2.5 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                <Library size={12} strokeWidth={1.5} />
                资源库导入
              </button>
            </div>
          </div>

          {mockHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[13px] text-[#444]">尚无生成记录</p>
            </div>
          ) : (
            <div className="flex-1 flex min-h-0">
              {/* Main scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {mockHistory.map((record) => {
                  const img = record.images[0];
                  const isAdded = img ? addedImages.has(img.id) : false;
                  return (
                    <div
                      key={record.id}
                      ref={(el) => { recordRefs.current[record.id] = el; }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[12px] text-[#999] leading-[1.6] truncate flex-1 min-w-0 mr-3">
                          {record.prompt}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-[#555]">{record.model}</span>
                          <span className="text-[11px] text-[#444]">·</span>
                          <span className="text-[11px] text-[#555]">{record.ratio}</span>
                          <span className="text-[11px] text-[#444]">·</span>
                          <span className="text-[11px] text-[#444]">
                            <Clock size={9} strokeWidth={1.5} className="inline mr-0.5 -mt-px" />
                            {record.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="max-h-[400px] rounded-lg overflow-hidden border border-white/[0.06] bg-[#141414] flex items-center justify-center relative">
                        <div className="w-full aspect-video max-h-[400px] bg-gradient-to-br from-[#1a1a1a] to-[#141414] flex items-center justify-center">
                          <Mountain size={48} strokeWidth={0.5} className="text-white/[0.06]" />
                        </div>
                        {isAdded && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#00CAE0]/20 flex items-center justify-center">
                            <Check size={12} strokeWidth={2} className="text-[#00CAE0]" />
                          </div>
                        )}
                      </div>
                      {img && (
                        <div className="px-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#555]">{img.name}</span>
                            <button onClick={() => toggleAdded(img.id)} className={`h-7 px-3 rounded-full text-[11px] flex items-center gap-1 transition-colors duration-200 ${isAdded ? "bg-[#00CAE0]/10 text-[#00CAE0] hover:bg-[#00CAE0]/15" : "bg-white/[0.06] text-[#999] hover:bg-white/[0.1] hover:text-white"}`}>
                              {isAdded ? <><Check size={10} strokeWidth={2} />已添加</> : <><Plus size={10} strokeWidth={1.5} />添加为场景图</>}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button className="h-7 px-2.5 rounded-full bg-white/[0.06] text-[11px] text-[#999] flex items-center gap-1 hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                              超清放大
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Thumbnail strip */}
              <div className="w-[56px] shrink-0 overflow-y-auto py-3 pl-1 pr-2 space-y-2">
                {mockHistory.map((record) => {
                  const img = record.images[0];
                  const isAdded = img ? addedImages.has(img.id) : false;
                  const isActive = activeRecordId === record.id;
                  return (
                    <button
                      key={record.id}
                      onClick={() => scrollToRecord(record.id)}
                      className={`w-full aspect-video rounded-md overflow-hidden relative transition-all duration-200 ${
                        isActive
                          ? "ring-2 ring-white/30 bg-[#1a1a1a]"
                          : "opacity-50 hover:opacity-80 bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center">
                        <Mountain size={10} strokeWidth={1} className="text-white/[0.06]" />
                      </div>
                      {isAdded && (
                        <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#00CAE0]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reference image picker modal */}
      {refModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[640px] max-h-[80vh] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
              <h3 className="text-[15px] font-medium">选择参考图</h3>
              <button onClick={() => { setRefModalOpen(false); setRefSelected(new Set()); }} className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 mx-5 mt-4 rounded-full bg-white/[0.06] shrink-0">
              <button onClick={() => setRefTab("library")} className={`flex-1 h-8 rounded-full text-[13px] flex items-center justify-center gap-1.5 transition-all duration-200 ${refTab === "library" ? "bg-white/10 text-white" : "text-[#999] hover:text-white"}`}>
                <Library size={14} strokeWidth={1.5} />
                资源库
              </button>
              <button onClick={() => setRefTab("upload")} className={`flex-1 h-8 rounded-full text-[13px] flex items-center justify-center gap-1.5 transition-all duration-200 ${refTab === "upload" ? "bg-white/10 text-white" : "text-[#999] hover:text-white"}`}>
                <Upload size={14} strokeWidth={1.5} />
                本地上传
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              {refTab === "library" ? (
                <>
                  <div className="h-8 px-3 rounded-full bg-[#262626] flex items-center gap-2 text-[12px] text-[#666] mb-4">
                    <Search size={14} strokeWidth={1.5} />
                    搜索资源...
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {mockLibrary.map((item) => {
                      const isSelected = refSelected.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleRefSelect(item.id)}
                          className={`rounded-lg overflow-hidden border transition-all duration-200 ${
                            isSelected
                              ? "border-[#00CAE0]/40 ring-1 ring-[#00CAE0]/30"
                              : "border-white/[0.06] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                          }`}
                        >
                          <div className="aspect-video bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center relative">
                            <Mountain size={16} strokeWidth={1} className="text-white/[0.06]" />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00CAE0] flex items-center justify-center">
                                <Check size={10} strokeWidth={2} className="text-black" />
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-[#141414]">
                            <p className="text-[11px] text-[#ccc] truncate">{item.name}</p>
                            <p className="text-[10px] text-[#555] mt-0.5">{item.source}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/[0.1] rounded-xl hover:border-white/[0.2] transition-colors duration-200 cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                    <Upload size={24} strokeWidth={1.5} className="text-[#666]" />
                  </div>
                  <p className="text-[14px] text-[#999] mb-1">点击或拖拽图片到此区域</p>
                  <p className="text-[12px] text-[#555]">支持 PNG、JPG、WebP，单张最大 10MB</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] shrink-0">
              <span className="text-[12px] text-[#666]">
                {refSelected.size > 0 ? `已选择 ${refSelected.size} 张` : "点击图片选择"}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => { setRefModalOpen(false); setRefSelected(new Set()); }} className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
                  取消
                </button>
                <button
                  onClick={confirmRefSelect}
                  disabled={refSelected.size === 0}
                  className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Plus size={14} strokeWidth={2} />
                  添加 {refSelected.size > 0 ? `${refSelected.size} 张` : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
