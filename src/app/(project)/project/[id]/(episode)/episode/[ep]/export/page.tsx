"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Play, Pause, SkipBack, SkipForward, Maximize2,
  Download, Upload, Music, Volume2, Type, ArrowRightLeft,
  Check, Film, AlertTriangle, Plus, X, ChevronDown,
  ChevronLeft, ChevronRight, Trash2,
} from "lucide-react";
import { getShotsByEpisode, getVersionsByShot } from "@/mocks/shots";
import { getEpisodeById } from "@/mocks/episodes";
import { getAssetsByType } from "@/mocks/assets";
import { bgmTracks, soundEffects, transitions, subtitles } from "@/mocks/export";

type Tab = "source" | "audio" | "subtitle" | "transition";

interface ClipSource {
  type: "shot_version" | "shot_placeholder" | "asset";
  shotId?: string;
  versionId?: string;
  assetId?: string;
  shotNumber?: number;
  version?: number;
  assetName?: string;
}

interface TimelineClip {
  id: string;
  label: string;
  durationSec: number;
  source: ClipSource;
  ready: boolean;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function dur(d: string) {
  return parseInt(d) || 0;
}

function uid() {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ExportPage() {
  const params = useParams<{ id: string; ep: string }>();
  const episode = getEpisodeById(params.ep);
  const shots = getShotsByEpisode(params.ep);

  const [clips, setClips] = useState<TimelineClip[]>(() =>
    shots.map((shot) => {
      const versions = getVersionsByShot(shot.id).filter((v) => v.status === "completed");
      const latest = versions[0];
      return {
        id: `clip-${shot.id}`,
        label: latest ? `镜头 ${shot.number} · v${latest.version}` : `镜头 ${shot.number}`,
        durationSec: dur(shot.duration),
        source: {
          type: latest ? ("shot_version" as const) : ("shot_placeholder" as const),
          shotId: shot.id,
          versionId: latest?.id,
          shotNumber: shot.number,
          version: latest?.version,
        },
        ready: shot.videoStatus === "completed",
      };
    })
  );

  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("source");
  const [isPlaying, setIsPlaying] = useState(false);
  const [assignedBGMId, setAssignedBGMId] = useState("bgm-1");
  const [expandedShotId, setExpandedShotId] = useState<string | null>(
    shots.find((s) => getVersionsByShot(s.id).filter((v) => v.status === "completed").length > 1)?.id ?? null
  );
  const [showImport, setShowImport] = useState(false);
  const [shotTransitions, setShotTransitions] = useState<Record<number, string>>({});

  if (!episode) return null;

  if (shots.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
            <Film size={24} strokeWidth={1.5} className="text-[#333]" />
          </div>
          <div className="text-center">
            <p className="text-[15px] text-[#666]">尚无镜头数据</p>
            <p className="text-[13px] text-[#444] mt-1">请先完成分镜和视频生成</p>
          </div>
          <Link
            href={`/project/${params.id}/episode/${params.ep}/storyboard`}
            className="mt-1 h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-2 hover:bg-white/90 active:scale-[0.97] transition-all duration-100"
          >
            前往分镜
          </Link>
        </div>
      </div>
    );
  }

  const totalSec = clips.reduce((a, c) => a + c.durationSec, 0);
  const readyCount = clips.filter((c) => c.ready).length;
  const allReady = clips.length > 0 && readyCount === clips.length;
  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const selectedIdx = selectedClip ? clips.indexOf(selectedClip) : -1;
  const videoAssets = getAssetsByType("video");

  function addVersionClip(
    shotId: string,
    shotNumber: number,
    v: { id: string; version: number; duration: string }
  ) {
    setClips((prev) => [
      ...prev,
      {
        id: uid(),
        label: `镜头 ${shotNumber} · v${v.version}`,
        durationSec: dur(v.duration),
        source: { type: "shot_version", shotId, versionId: v.id, shotNumber, version: v.version },
        ready: true,
      },
    ]);
  }

  function addAssetClip(asset: { id: string; name: string }) {
    setClips((prev) => [
      ...prev,
      {
        id: uid(),
        label: asset.name,
        durationSec: 5,
        source: { type: "asset", assetId: asset.id, assetName: asset.name },
        ready: true,
      },
    ]);
  }

  function removeClip(clipId: string) {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
    if (selectedClipId === clipId) setSelectedClipId(null);
  }

  function moveClip(clipId: string, dir: -1 | 1) {
    setClips((prev) => {
      const i = prev.findIndex((c) => c.id === clipId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#666]">剪辑</span>
          <span className="text-[13px] text-white/[0.12]">|</span>
          <span className="text-[13px] text-[#999]">
            {clips.length} 个片段 · {readyCount} 就绪
          </span>
          {!allReady && clips.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-[#f59e0b]">
              <AlertTriangle size={12} strokeWidth={1.5} />
              部分片段未就绪
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 rounded-full bg-white/[0.06] text-white text-[12px] flex items-center gap-1.5 hover:bg-white/[0.1] transition-colors duration-200">
            <Upload size={14} strokeWidth={1.5} />
            视频超分
          </button>
          <button
            disabled={!allReady}
            className={`h-8 px-4 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all duration-200 ${
              allReady
                ? "bg-white text-black hover:bg-white/90 active:scale-[0.97]"
                : "bg-white/[0.06] text-[#666] cursor-not-allowed"
            }`}
          >
            <Download size={14} strokeWidth={allReady ? 2 : 1.5} />
            导出成片
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Material Panel */}
        <div className="w-[280px] border-r border-white/[0.06] flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {(
              [
                { key: "source" as Tab, label: "素材源", Icon: Film },
                { key: "audio" as Tab, label: "音频", Icon: Music },
                { key: "subtitle" as Tab, label: "字幕", Icon: Type },
                { key: "transition" as Tab, label: "转场", Icon: ArrowRightLeft },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] transition-colors duration-200 ${
                  activeTab === key ? "text-white bg-white/[0.08]" : "text-[#666] hover:text-[#999]"
                }`}
              >
                <Icon size={12} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto">
            {/* ── Source Tab ── */}
            {activeTab === "source" && (
              <div className="py-2">
                <p className="text-[11px] text-[#444] px-3 mb-2">镜头素材</p>

                {shots.map((shot) => {
                  const versions = getVersionsByShot(shot.id).filter((v) => v.status === "completed");
                  const expanded = expandedShotId === shot.id;
                  const displayVersions = expanded ? versions : versions.slice(0, 1);

                  return (
                    <div key={shot.id} className="mb-0.5">
                      <div
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-white/[0.04] transition-colors duration-200 ${
                          expanded ? "bg-white/[0.02]" : ""
                        }`}
                        onClick={() => versions.length > 0 && setExpandedShotId(expanded ? null : shot.id)}
                      >
                        <div className="w-16 h-[38px] rounded bg-[#262626] border border-white/[0.06] shrink-0 flex items-center justify-center overflow-hidden">
                          {shot.hasVideo ? (
                            <Play size={12} strokeWidth={1.5} className="text-[#00CAE0]" />
                          ) : shot.videoStatus === "generating" ? (
                            <div className="w-3 h-3 border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin" />
                          ) : (
                            <span className="text-[9px] text-[#333]">{shot.number}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-[#999]">镜头 {shot.number}</p>
                          <p className="text-[10px] text-[#444] mt-0.5 truncate">{shot.description}</p>
                        </div>
                        {versions.length > 1 && (
                          <ChevronDown
                            size={12}
                            strokeWidth={1.5}
                            className={`text-[#444] transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>

                      {displayVersions.map((v) => {
                        const onTimeline = clips.some((c) => c.source.versionId === v.id);
                        return (
                          <div
                            key={v.id}
                            className="flex items-center gap-2.5 px-3 pl-6 py-1.5 border-l border-white/[0.04] ml-6 hover:bg-white/[0.02] transition-colors duration-200"
                          >
                            <div className="w-12 h-[28px] rounded bg-[#262626] border border-white/[0.06] shrink-0 flex items-center justify-center">
                              <Play size={9} strokeWidth={1.5} className="text-[#666]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-[#999]">v{v.version}</span>
                                <span className="text-[10px] text-[#444]">{v.duration}</span>
                                <span className="text-[10px] text-[#333]">{v.createdAt}</span>
                              </div>
                            </div>
                            {onTimeline && <span className="text-[9px] text-[#00CAE0]/50 shrink-0">已添加</span>}
                            <button
                              onClick={() => addVersionClip(shot.id, shot.number, v)}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.08] transition-colors duration-200 shrink-0"
                              title="添加到时间线"
                            >
                              <Plus size={11} strokeWidth={1.5} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Import */}
                <div className="px-3 pt-4">
                  <div className="h-px bg-white/[0.06] mb-3" />
                  <button
                    onClick={() => setShowImport(!showImport)}
                    className="flex items-center gap-1.5 text-[11px] text-[#666] hover:text-[#999] transition-colors duration-200"
                  >
                    从资源库导入
                    <ChevronDown
                      size={10}
                      strokeWidth={1.5}
                      className={`transition-transform duration-200 ${showImport ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showImport && (
                    <div className="mt-2 space-y-1">
                      {videoAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-white/[0.04] transition-colors duration-200"
                        >
                          <div className="w-12 h-[28px] rounded bg-[#262626] border border-white/[0.06] shrink-0 flex items-center justify-center">
                            <Film size={9} strokeWidth={1.5} className="text-[#666]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-[#999] truncate">{asset.name}</p>
                            <p className="text-[10px] text-[#333]">{asset.sourceProject}</p>
                          </div>
                          <button
                            onClick={() => addAssetClip(asset)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.08] transition-colors duration-200 shrink-0"
                          >
                            <Plus size={11} strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                      {videoAssets.length === 0 && (
                        <p className="text-[11px] text-[#333] px-2 py-1">暂无可导入的视频素材</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Audio Tab ── */}
            {activeTab === "audio" && (
              <div className="py-2">
                <p className="text-[11px] text-[#444] px-3 mb-2">背景音乐</p>
                <div className="px-3 space-y-1.5">
                  {bgmTracks.map((track) => {
                    const active = assignedBGMId === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => setAssignedBGMId(track.id)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-200 text-left ${
                          active
                            ? "bg-white/[0.08] border-white/[0.12]"
                            : "bg-[#141414] border-white/[0.06] hover:border-white/[0.1]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                            active ? "bg-[#00CAE0]/10" : "bg-white/[0.04]"
                          }`}
                        >
                          <Music
                            size={14}
                            strokeWidth={1.5}
                            className={active ? "text-[#00CAE0]" : "text-[#666]"}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-[#999] truncate">{track.name}</p>
                          <p className="text-[10px] text-[#444] mt-0.5">{fmt(track.duration)}</p>
                        </div>
                        {active && <Check size={13} strokeWidth={1.5} className="text-[#00CAE0] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-[#444] px-3 mt-4 mb-2">音效</p>
                <div className="px-3 space-y-1.5">
                  {soundEffects.map((sfx) => (
                    <div
                      key={sfx.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#141414] border border-white/[0.06]"
                    >
                      <div className="w-8 h-8 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0">
                        <Volume2 size={14} strokeWidth={1.5} className="text-[#666]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#999]">{sfx.name}</p>
                        <p className="text-[10px] text-[#444] mt-0.5">
                          {sfx.category} · {sfx.duration}s
                        </p>
                      </div>
                      <button className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.08] transition-colors duration-200">
                        <Plus size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Subtitle Tab ── */}
            {activeTab === "subtitle" && (
              <div className="p-3 space-y-1.5">
                {clips
                  .filter((c) => c.source.shotId)
                  .map((clip) => {
                    const sub = subtitles.find((s) => s.shotId === clip.source.shotId);
                    if (!sub) return null;
                    const active = selectedClipId === clip.id;
                    return (
                      <button
                        key={`${clip.id}-sub`}
                        onClick={() => setSelectedClipId(clip.id)}
                        className={`w-full p-2.5 rounded-lg border text-left transition-colors duration-200 ${
                          active
                            ? "bg-white/[0.08] border-white/[0.12]"
                            : "bg-[#141414] border-white/[0.06] hover:border-white/[0.1]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-[#444]">{clip.label}</span>
                        </div>
                        <p className="text-[12px] text-[#999] leading-[1.7]">{sub.text}</p>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* ── Transition Tab ── */}
            {activeTab === "transition" && (
              <div className="p-3 space-y-1.5">
                <p className="text-[11px] text-[#444] px-0.5 mb-2">片段间转场</p>
                {clips.length < 2 ? (
                  <p className="text-[11px] text-[#333]">至少需要 2 个片段</p>
                ) : (
                  clips.slice(0, -1).map((clip, i) => {
                    const next = clips[i + 1];
                    const sel = shotTransitions[i];
                    return (
                      <div key={i} className="p-2.5 rounded-lg bg-[#141414] border border-white/[0.06]">
                        <p className="text-[10px] text-[#444] mb-2 truncate">
                          {clip.label} → {next.label}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {transitions.map((t) => (
                            <button
                              key={t.id}
                              onClick={() =>
                                setShotTransitions((prev) => ({
                                  ...prev,
                                  [i]: prev[i] === t.id ? "" : t.id,
                                }))
                              }
                              className={`px-2 py-0.5 rounded-full text-[10px] transition-colors duration-200 ${
                                sel === t.id
                                  ? "bg-white/[0.1] text-white border border-white/[0.12]"
                                  : "bg-white/[0.04] text-[#666] hover:bg-white/[0.06]"
                              }`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview + Timeline */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Preview */}
          <div className="flex-1 flex items-center justify-center p-5 pb-2 min-h-0">
            <div className="w-full max-w-3xl space-y-2.5">
              {/* Player */}
              <div className="aspect-video rounded-xl bg-[#141414] border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                {selectedClip ? (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center">
                      <Play size={22} strokeWidth={1.5} className="text-white/60 ml-0.5" />
                    </div>
                    <div>
                      <p className="text-[13px] text-[#999]">{selectedClip.label}</p>
                      <p className="text-[12px] text-[#666] mt-1">{selectedClip.durationSec}s</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center">
                      <Film size={22} strokeWidth={1.5} className="text-[#333]" />
                    </div>
                    <div>
                      <p className="text-[15px] text-[#666]">
                        第 {episode.episodeNumber} 集 — {episode.title}
                      </p>
                      <p className="text-[12px] text-[#444] mt-1">
                        {clips.length} 个片段 · 预计时长 {fmt(totalSec)}
                      </p>
                    </div>
                  </div>
                )}
                <button className="absolute bottom-3 right-3 w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.1] transition-colors duration-200">
                  <Maximize2 size={13} strokeWidth={1.5} />
                </button>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2 px-1">
                <button
                  onClick={() => clips[0] && setSelectedClipId(clips[0].id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
                >
                  <SkipBack size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/[0.1] transition-colors duration-200"
                >
                  {isPlaying ? (
                    <Pause size={14} strokeWidth={1.5} />
                  ) : (
                    <Play size={14} strokeWidth={1.5} className="ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => clips.length > 0 && setSelectedClipId(clips[clips.length - 1].id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
                >
                  <SkipForward size={14} strokeWidth={1.5} />
                </button>
                <span className="text-[12px] text-[#666] ml-1 tabular-nums">
                  {selectedClip
                    ? fmt(clips.slice(0, selectedIdx).reduce((a, c) => a + c.durationSec, 0))
                    : "00:00"}{" "}
                  / {fmt(totalSec)}
                </span>
                <div className="flex-1" />
                <Volume2 size={13} strokeWidth={1.5} className="text-[#666]" />
              </div>

              {/* Clip Actions */}
              {selectedClip && (
                <div className="flex items-center gap-1.5 px-1">
                  <button
                    onClick={() => moveClip(selectedClip.id, -1)}
                    disabled={selectedIdx <= 0}
                    className="h-7 px-2 rounded-md flex items-center gap-1 text-[11px] text-[#666] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft size={12} strokeWidth={1.5} />
                    前移
                  </button>
                  <button
                    onClick={() => moveClip(selectedClip.id, 1)}
                    disabled={selectedIdx >= clips.length - 1}
                    className="h-7 px-2 rounded-md flex items-center gap-1 text-[11px] text-[#666] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    后移
                    <ChevronRight size={12} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => removeClip(selectedClip.id)}
                    className="h-7 px-2 rounded-md flex items-center gap-1 text-[11px] text-[#666] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors duration-200"
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                    删除
                  </button>
                  <div className="flex-1" />
                  <span className="text-[11px] text-[#444]">
                    {selectedClip.label} · {selectedClip.durationSec}s
                    {selectedClip.source.version != null && ` · v${selectedClip.source.version}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Timeline ── */}
          <div className="shrink-0 border-t border-white/[0.06]">
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/[0.06]">
              <span className="text-[11px] text-[#444]">时间线</span>
              <div className="flex items-center gap-3">
                {!allReady && clips.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-[#f59e0b]">
                    <AlertTriangle size={10} strokeWidth={1.5} />
                    {clips.length - readyCount} 个片段未就绪
                  </span>
                )}
                <span className="text-[10px] text-[#333] tabular-nums">{fmt(totalSec)}</span>
              </div>
            </div>

            <div className="px-4 py-2 space-y-1">
              {clips.length === 0 ? (
                <div className="h-10 flex items-center justify-center text-[11px] text-[#444]">
                  时间线为空 — 从左侧素材源添加片段
                </div>
              ) : (
                <>
                  {/* Video Track */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#333] w-6 shrink-0">视频</span>
                    <div className="flex-1 flex h-10 rounded-md overflow-hidden gap-[2px]">
                      {clips.map((clip) => {
                        const w = totalSec > 0 ? (clip.durationSec / totalSec) * 100 : 0;
                        const sel = selectedClipId === clip.id;
                        return (
                          <div
                            key={clip.id}
                            style={{ width: `${w}%` }}
                            className={`relative group flex items-center justify-center transition-all duration-200 ${
                              sel
                                ? "bg-[#00CAE0]/20 border-2 border-[#00CAE0]/40 rounded-md z-10"
                                : clip.ready
                                  ? "bg-[#1c1c1c] border border-white/[0.06] hover:bg-[#262626] rounded-sm"
                                  : "bg-[#1c1c1c]/50 border border-dashed border-white/[0.04] rounded-sm"
                            }`}
                          >
                            <button
                              onClick={() => setSelectedClipId(sel ? null : clip.id)}
                              className="w-full h-full flex items-center justify-center"
                            >
                              <span className={`text-[10px] ${clip.ready ? "text-[#999]" : "text-[#444]"}`}>
                                {clip.source.shotNumber
                                  ? `${clip.source.shotNumber}${clip.source.version ? `·v${clip.source.version}` : ""}`
                                  : "素材"}
                              </span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#333] text-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-[#ef4444] hover:text-white"
                            >
                              <X size={8} strokeWidth={2} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Audio Track */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#333] w-6 shrink-0">音频</span>
                    <div className="flex-1 h-7 rounded-md bg-[#1c1c1c] border border-white/[0.06] flex items-center px-2.5 overflow-hidden">
                      {assignedBGMId && (
                        <div className="flex items-center gap-1.5">
                          <Music size={10} strokeWidth={1.5} className="text-[#00CAE0] shrink-0" />
                          <span className="text-[10px] text-[#999] truncate">
                            {bgmTracks.find((b) => b.id === assignedBGMId)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtitle Track */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#333] w-6 shrink-0">字幕</span>
                    <div className="flex-1 flex h-7 rounded-md overflow-hidden gap-[2px]">
                      {clips.map((clip) => {
                        const w = totalSec > 0 ? (clip.durationSec / totalSec) * 100 : 0;
                        const sub = clip.source.shotId
                          ? subtitles.find((s) => s.shotId === clip.source.shotId)
                          : null;
                        return (
                          <div
                            key={clip.id}
                            style={{ width: `${w}%` }}
                            className="bg-[#1c1c1c] border border-white/[0.06] flex items-center px-1.5 overflow-hidden rounded-sm"
                          >
                            {sub && <span className="text-[9px] text-[#555] truncate">{sub.text}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
