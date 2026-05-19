"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Download,
  Trash2,
  Clock,
  Volume2,
  Send,
  Check,
  Image as ImageIcon,
  ChevronDown,
  Coins,
} from "lucide-react";
import { type Shot, type VideoVersion, getVersionsByShot } from "@/mocks/shots";
import { calcVideoCost } from "@/lib/pricing";

const statusConfig = {
  pending: { label: "等待中", style: "bg-white/[0.06] text-[#999]" },
  generating: { label: "生成中", style: "bg-[rgba(0,202,224,0.08)] text-[#00CAE0]" },
  completed: { label: "已完成", style: "bg-white/[0.08] text-white/60" },
};

function Dropdown({
  value,
  options,
  onChange,
  icon: Icon,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ElementType;
}) {
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
      <button
        onClick={() => setOpen(!open)}
        className="h-7 px-2.5 rounded-full bg-white/[0.06] text-[12px] text-[#999] flex items-center gap-1.5 hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
      >
        {Icon && <Icon size={13} strokeWidth={1.5} />}
        {value}
        <ChevronDown size={12} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 py-1 rounded-lg border border-white/[0.08] bg-[#1c1c1c] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-10 min-w-[80px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors duration-200 ${
                opt === value ? "text-white bg-white/[0.06]" : "text-[#999] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoShotOverlay({
  open,
  onClose,
  shots,
  initialShotId,
}: {
  open: boolean;
  onClose: () => void;
  shots: Shot[];
  initialShotId: string;
}) {
  const [activeShotId, setActiveShotId] = useState(initialShotId);
  const [prompt, setPrompt] = useState("");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [activeVersionId, setActiveVersionId] = useState<string>("");
  const [appliedVersionId, setAppliedVersionId] = useState<string>("");
  const versionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Params
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [selectedSound, setSelectedSound] = useState("有声");

  if (!open) return null;

  const activeIndex = shots.findIndex((s) => s.id === activeShotId);
  const activeShot = shots[activeIndex] ?? shots[0];
  const versions = getVersionsByShot(activeShot.id);
  const hasHistory = versions.length > 0;
  const maxVisible = 7;
  const canScrollLeft = scrollOffset > 0;
  const canScrollRight = scrollOffset + maxVisible < shots.length;
  const visibleShots = shots.slice(scrollOffset, scrollOffset + maxVisible);

  function scrollPrev() {
    setScrollOffset(Math.max(0, scrollOffset - 1));
  }
  function scrollNext() {
    setScrollOffset(Math.min(shots.length - maxVisible, scrollOffset + 1));
  }
  function selectShot(shotId: string) {
    setActiveShotId(shotId);
    setPrompt("");
    const idx = shots.findIndex((s) => s.id === shotId);
    if (idx < scrollOffset) setScrollOffset(idx);
    else if (idx >= scrollOffset + maxVisible) setScrollOffset(idx - maxVisible + 1);
  }

  function scrollToVersion(id: string) {
    setActiveVersionId(id);
    versionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-5 py-3 border-b border-white/[0.06]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[13px] text-[#999] hover:text-white transition-colors duration-200 shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          返回
        </button>

        <div className="w-px h-6 bg-white/[0.06] shrink-0" />

        {/* Thumbnail strip */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-center py-2">
          {visibleShots.map((shot) => {
            const isActive = shot.id === activeShotId;
            return (
              <button
                key={shot.id}
                onClick={() => selectShot(shot.id)}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div
                  className={`w-16 h-10 rounded-md bg-[#262626] flex items-center justify-center transition-all duration-200 ${
                    isActive ? "ring-2 ring-white/20 bg-[#1c1c1c]" : "hover:bg-[#1c1c1c]"
                  }`}
                >
                  {shot.hasImage ? (
                    <ImageIcon size={12} strokeWidth={1.5} className="text-[#00CAE0]/60" />
                  ) : (
                    <span className="text-[9px] text-[#444]">#{shot.number}</span>
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? "text-white" : "text-[#666]"}`}>
                  镜头 {shot.number}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {shots.length > maxVisible && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-default transition-colors duration-200"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollRight}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-default transition-colors duration-200"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* Main content: two-panel card layout */}
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
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="w-20 h-20 rounded-lg bg-[#262626] border border-white/[0.06] flex items-center justify-center"
                  >
                    <ImageIcon size={16} strokeWidth={1.5} className="text-[#444]" />
                  </div>
                ))}
                <button className="w-20 h-20 rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center text-[#666] hover:border-white/[0.2] hover:text-[#999] transition-colors duration-200">
                  <Plus size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Prompt */}
            <div className="flex-1 flex flex-col p-4 min-h-0">
              <p className="text-[12px] text-[#666] mb-2 shrink-0">提示词</p>
              <textarea
                value={prompt || activeShot.prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的视频..."
                className="flex-1 w-full bg-[#262626] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-[#ccc] leading-[1.7] placeholder:text-white/25 resize-none outline-none focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] transition-colors duration-200"
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="shrink-0 px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="h-7 px-2.5 rounded-full bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] text-[12px] font-medium border border-[rgba(0,202,224,0.15)]">
                  Seedance 2.0
                </button>
                <Dropdown value={selectedDuration} options={["5s", "10s"]} onChange={setSelectedDuration} icon={Clock} />
                <Dropdown value={selectedRatio} options={["16:9", "9:16", "1:1"]} onChange={setSelectedRatio} />
                <Dropdown value={selectedSound} options={["有声", "无声"]} onChange={setSelectedSound} icon={Volume2} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#666] flex items-center gap-1">
                  <Coins size={12} strokeWidth={1.5} className="text-[#00CAE0]" />
                  {calcVideoCost(selectedDuration)} 积分
                </span>
                <button className="h-9 px-5 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200">
                  <Send size={14} strokeWidth={2} />
                  生成视频
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — history & preview */}
        <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#141414] flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
            <h3 className="text-[15px] font-medium">生成历史</h3>
            {hasHistory && (
              <span className="text-[12px] text-[#666]">{versions.length} 个版本</span>
            )}
          </div>

          {!hasHistory ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  <Play size={24} strokeWidth={1.5} className="text-[#666]" />
                </div>
                <p className="text-[13px] text-[#666] mb-1">尚无生成记录</p>
                <p className="text-[12px] text-[#444]">在左侧配置参数后点击生成</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex min-h-0">
              {/* Main scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {versions.map((v) => {
                  const cfg = statusConfig[v.status];
                  const isApplied = appliedVersionId === v.id;
                  return (
                    <div
                      key={v.id}
                      ref={(el) => { versionRefs.current[v.id] = el; }}
                      className="space-y-2"
                    >
                      {/* Header: version + status + meta */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium">V{v.version}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.style}`}>
                            {cfg.label}
                          </span>
                          {isApplied && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#00CAE0]/10 text-[#00CAE0] text-[10px] font-medium flex items-center gap-1">
                              <Check size={9} strokeWidth={2} />
                              当前使用
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-[#555]">{v.duration}</span>
                          <span className="text-[11px] text-[#444]">·</span>
                          <span className="text-[11px] text-[#444]">
                            <Clock size={9} strokeWidth={1.5} className="inline mr-0.5 -mt-px" />
                            {v.createdAt}
                          </span>
                        </div>
                      </div>
                      {/* Prompt */}
                      <p className="text-[12px] text-[#999] leading-[1.6] px-1 line-clamp-2">
                        {v.prompt}
                      </p>
                      {/* Video preview */}
                      <div className={`aspect-video rounded-lg overflow-hidden border flex items-center justify-center relative transition-colors duration-200 ${
                        isApplied
                          ? "border-[#00CAE0]/30 bg-[#1a1a1a]"
                          : "border-white/[0.06] bg-[#1a1a1a]"
                      }`}>
                        {v.status === "generating" ? (
                          <div className="w-8 h-8 border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin" />
                        ) : v.status === "completed" ? (
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors duration-200">
                            <Play size={20} strokeWidth={1.5} className="text-white ml-0.5" />
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#444]">等待生成</span>
                        )}
                      </div>
                      {/* Actions */}
                      {v.status === "completed" && (
                        <div className="flex items-center justify-between px-1">
                          <button
                            onClick={() => setAppliedVersionId(v.id)}
                            className={`h-7 px-3 rounded-full text-[11px] flex items-center gap-1.5 transition-colors duration-200 ${
                              isApplied
                                ? "bg-[#00CAE0]/10 text-[#00CAE0]"
                                : "bg-white/[0.06] text-[#999] hover:bg-[rgba(0,202,224,0.08)] hover:text-[#00CAE0]"
                            }`}
                          >
                            {isApplied ? (
                              <><Check size={10} strokeWidth={2} />当前使用</>
                            ) : (
                              "应用此版本"
                            )}
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
                              <Download size={14} strokeWidth={1.5} />
                            </button>
                            <button className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-[#ef4444] hover:bg-white/[0.06] transition-colors duration-200">
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Thumbnail strip */}
              {versions.length > 1 && (
                <div className="w-[80px] shrink-0 overflow-y-auto py-3 pl-1 pr-2 space-y-2">
                  {versions.map((v) => {
                    const isApplied = appliedVersionId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => scrollToVersion(v.id)}
                        className="w-full aspect-video rounded-md overflow-hidden relative transition-all duration-200 bg-[#1a1a1a] hover:opacity-100 opacity-60"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-[#222] to-[#141414] flex items-center justify-center">
                          {v.status === "generating" ? (
                            <div className="w-3 h-3 border border-white/20 border-t-[#00CAE0] rounded-full animate-spin" />
                          ) : (
                            <Play size={12} strokeWidth={1.5} className="text-[#00CAE0]/40" />
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-1 py-0.5">
                          <span className="text-[9px] text-white/60">V{v.version}</span>
                          {isApplied && (
                            <Check size={8} strokeWidth={2.5} className="text-[#00CAE0]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
