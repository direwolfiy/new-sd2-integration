"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Coins,
  Film,
  ImageIcon,
  Loader2,
  Play,
  Send,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import { elementsApi, episodesApi, shotsApi, useApi } from "@/lib/api";
import { adaptElements, getChapterContent } from "@/lib/adapters";
import type { ElementItem } from "@/mocks/types";
import type { SeedanceScriptItem } from "@/lib/api/shots";
import { useParams } from "next/navigation";
import { calcVideoCost } from "@/lib/pricing";

type VideoShot = {
  id: string;
  number: number;
  description: string;
  prompt: string;
  duration: number | null;
  hasVideo: boolean;
  videoCount: number;
  videoUrl: string | null;
};

const assetLabels: Record<ElementItem["type"], string> = {
  character: "角色",
  scene: "场景",
  prop: "道具",
  audio: "音频",
  script: "剧本",
};

function normalizeVideoShot(
  item: SeedanceScriptItem,
  index: number,
): VideoShot {
  const videoUrl =
    item.videoUrl ?? item.videoResultUrl ?? item.resultVideoUrl ?? null;
  return {
    id: String(item.id ?? index + 1),
    number: Number(item.sequence ?? index + 1),
    description: String(
      item.rawDescription ||
        item.speechContent ||
        item.sourceText ||
        item.dialogue ||
        "",
    ).trim(),
    prompt: String(item.videoPrompt ?? "").trim(),
    duration: item.estimatedDuration ?? null,
    hasVideo: Boolean(item.hasVideoResult || videoUrl),
    videoCount: Number(item.videoCount ?? (item.hasVideoResult ? 1 : 0)),
    videoUrl,
  };
}

function AssetPanel({ assets }: { assets: ElementItem[] }) {
  const groups = useMemo(() => {
    const visible = assets.filter(
      (asset) => asset.type !== "script" && asset.type !== "audio",
    );
    return (["character", "scene", "prop"] as const).map((type) => ({
      type,
      items: visible.filter((asset) => asset.type === type),
    }));
  }, [assets]);

  return (
    <aside className="flex min-h-0 w-[260px] shrink-0 flex-col border-r border-white/[0.12] bg-[#101010]">
      <div className="border-b border-white/[0.12] px-4 py-3">
        <h2 className="text-[13px] font-medium text-white">本集资产</h2>
        <p className="mt-0.5 text-[12px] text-[#888]">
          {assets.length} 个项目资产
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {groups.map((group) => (
          <section key={group.type} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-[#a3a3a3]">
                {assetLabels[group.type]}
              </span>
              <span className="text-[11px] text-[#777]">
                {group.items.length}
              </span>
            </div>
            {group.items.length === 0 ? (
              <div className="rounded-lg border border-white/[0.08] px-3 py-2 text-[12px] text-[#777]">
                暂无
              </div>
            ) : (
              <div className="space-y-1.5">
                {group.items.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-[#181818] p-2"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#2b2b2b]">
                      {asset.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : group.type === "character" ? (
                        <Users size={15} className="text-[#888]" />
                      ) : (
                        <ImageIcon size={15} className="text-[#888]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] text-[#d8d8d8]">
                        {asset.name || "未命名"}
                      </p>
                      {asset.tags.length > 0 && (
                        <p className="mt-0.5 truncate text-[10px] text-[#777]">
                          {asset.tags.join(" / ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </aside>
  );
}

function SelectPill({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: React.ElementType;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-[11px] text-[#8f8f8f]">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon
            size={13}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8f8f8f]"
          />
        )}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-8 w-full appearance-none rounded-md border border-white/[0.14] bg-[#202020] pr-7 text-[12px] text-[#d8d8d8] outline-none transition-colors duration-200 hover:border-white/[0.22] focus:border-[#00CAE0]/60 ${
            Icon ? "pl-7" : "pl-2.5"
          }`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function VideoPreview({
  shot,
  compact = false,
}: {
  shot: VideoShot;
  compact?: boolean;
}) {
  if (shot.videoUrl) {
    return (
      <video
        src={shot.videoUrl}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#202020]">
      {shot.hasVideo ? (
        <Play
          size={compact ? 14 : 24}
          strokeWidth={1.5}
          className="text-[#00CAE0]"
        />
      ) : (
        <span className={compact ? "text-[10px] text-[#777]" : "text-[13px] text-[#888]"}>
          暂无视频
        </span>
      )}
    </div>
  );
}

function GenerationHistory({ shot }: { shot: VideoShot }) {
  const hasHistory = shot.hasVideo || shot.videoUrl;
  const historyItems = hasHistory
    ? [
        {
          id: `${shot.id}-current`,
          version: 1,
          status: "已完成",
          prompt: shot.prompt || "未记录生成提示词",
          videoUrl: shot.videoUrl,
        },
      ]
    : [];

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.12] px-4 py-3">
        <div>
          <h3 className="text-[14px] font-medium text-white">生成历史</h3>
          <p className="mt-0.5 text-[12px] text-[#8f8f8f]">
            {hasHistory ? `${shot.videoCount || 1} 个视频结果` : "尚无生成记录"}
          </p>
        </div>
      </div>

      {historyItems.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.08]">
              <Film size={22} strokeWidth={1.5} className="text-[#777]" />
            </div>
            <p className="text-[13px] text-[#a3a3a3]">当前镜头还没有视频</p>
            <p className="mt-1 text-[12px] text-[#777]">
              生成完成后会在这里查看和对比结果
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {historyItems.map((item) => (
            <article key={item.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-white">
                    V{item.version}
                  </span>
                  <span className="rounded-full bg-[#00CAE0]/10 px-2 py-0.5 text-[10px] font-medium text-[#00CAE0]">
                    {item.status}
                  </span>
                </div>
                <button className="h-7 rounded-md bg-white/[0.08] px-3 text-[11px] text-[#d8d8d8] transition-colors hover:bg-white/[0.12] hover:text-white">
                  设为当前
                </button>
              </div>

              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-white/[0.12] bg-[#101010]">
                <VideoPreview shot={shot} />
              </div>

              <p className="line-clamp-3 text-[12px] leading-[1.7] text-[#a3a3a3]">
                {item.prompt}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function VideoPage() {
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("Seedance 2.0");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [selectedSound, setSelectedSound] = useState("有声");
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({});

  const { data: chapter } = useApi(
    () => episodesApi.fetchChapter(episodeId),
    [episodeId],
  );
  const { data: storyboardData, isLoading: shotsLoading } = useApi(
    () => shotsApi.fetchSeedanceScripts(episodeId, true),
    [episodeId],
  );
  const { data: rawAssets } = useApi(
    () => elementsApi.fetchElements(projectId),
    [projectId],
  );

  const assets = useMemo(() => adaptElements(rawAssets ?? []), [rawAssets]);
  const shots = useMemo(
    () => (storyboardData?.scripts ?? []).map(normalizeVideoShot),
    [storyboardData],
  );
  const selectedShot =
    shots.find((shot) => shot.id === selectedShotId) ?? shots[0] ?? null;
  const selectedPrompt =
    selectedShot == null
      ? ""
      : (promptDrafts[selectedShot.id] ?? selectedShot.prompt);
  const hasScript = !!getChapterContent(chapter).trim();
  const completedCount = shots.filter((shot) => shot.hasVideo).length;

  if (!hasScript) {
    const storyboardHref = `/project/${projectId}/episode/${episodeId}/storyboard`;
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
            <BookOpen size={24} strokeWidth={1.5} className="text-[#777]" />
          </div>
          <div className="text-center">
            <p className="text-[15px] text-[#a3a3a3]">该分集尚无剧本</p>
            <p className="mt-1 text-[13px] text-[#888]">
              视频生成需要先准备分集剧本和分镜
            </p>
          </div>
          <Link
            href={storyboardHref}
            className="mt-1 flex h-10 items-center rounded-full bg-white px-6 text-[13px] font-medium text-black transition-all hover:bg-white/90"
          >
            前往分镜
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <AssetPanel assets={assets} />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.12] px-6 py-3">
          <div>
            <h2 className="text-[15px] font-medium text-white">视频生成</h2>
            <p className="mt-0.5 text-[12px] text-[#a3a3a3]">
              {shots.length} 个镜头 · {completedCount} 个已有视频
              {storyboardData?.storyType
                ? ` · ${storyboardData.storyType}`
                : ""}
            </p>
          </div>
          <button className="flex h-8 items-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90">
            <Sparkles size={14} strokeWidth={1.5} />
            批量生成视频
          </button>
        </div>

        {shotsLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={22} className="animate-spin text-[#a3a3a3]" />
          </div>
        ) : shots.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
              <Film size={24} strokeWidth={1.5} className="text-[#777]" />
            </div>
            <div className="text-center">
              <p className="text-[15px] text-[#a3a3a3]">请先完成分镜</p>
              <p className="mt-1 text-[13px] text-[#888]">
                视频会按分镜镜头逐个生成
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {selectedShot && (
              <div className="grid min-h-0 flex-1 grid-cols-[minmax(380px,0.92fr)_minmax(420px,1.08fr)] gap-5 overflow-hidden p-6 pb-4">
                <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
                  <div className="shrink-0 border-b border-white/[0.12] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-medium text-white">
                          镜头 {selectedShot.number}
                        </h3>
                        <p className="mt-0.5 truncate text-[12px] text-[#8f8f8f]">
                          {selectedShot.description || "暂无画面描述"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                          selectedShot.hasVideo
                            ? "bg-[#00CAE0]/10 text-[#00CAE0]"
                            : "bg-white/[0.08] text-[#888]"
                        }`}
                      >
                        {selectedShot.hasVideo ? "已有视频" : "待生成"}
                      </span>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto p-4">
                    <div className="flex min-h-[420px] flex-col">
                      <p className="mb-1.5 text-[12px] font-medium text-[#b8b8b8]">
                        视频提示词
                      </p>
                      <textarea
                        value={selectedPrompt}
                        onChange={(event) =>
                          setPromptDrafts((drafts) => ({
                            ...drafts,
                            [selectedShot.id]: event.target.value,
                          }))
                        }
                        placeholder="描述镜头运动、角色动作、画面氛围和视频节奏"
                        className="min-h-[400px] w-full resize-none rounded-md border border-white/[0.14] bg-[#101010] px-3 py-2.5 text-[13px] leading-[1.7] text-[#d8d8d8] outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#00CAE0]/60"
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-end justify-between gap-3 border-t border-white/[0.12] px-4 py-3">
                    <div className="grid min-w-0 flex-1 grid-cols-4 gap-2">
                      <SelectPill
                        label="模型"
                        value={selectedModel}
                        options={["Seedance 2.0"]}
                        onChange={setSelectedModel}
                      />
                      <SelectPill
                        label="时长"
                        value={selectedDuration}
                        options={["5s", "10s"]}
                        onChange={setSelectedDuration}
                        icon={Clock}
                      />
                      <SelectPill
                        label="比例"
                        value={selectedRatio}
                        options={["16:9", "9:16", "1:1"]}
                        onChange={setSelectedRatio}
                      />
                      <SelectPill
                        label="声音"
                        value={selectedSound}
                        options={["有声", "无声"]}
                        onChange={setSelectedSound}
                        icon={Volume2}
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-3 pb-0.5">
                      <span className="flex items-center gap-1.5 text-[12px] text-[#a3a3a3]">
                        <Coins
                          size={13}
                          strokeWidth={1.5}
                          className="text-[#00CAE0]"
                        />
                        {calcVideoCost(selectedDuration)} 积分
                      </span>
                      <button className="flex h-9 items-center gap-1.5 rounded-full bg-white px-5 text-[13px] font-medium text-black transition-all hover:bg-white/90 active:scale-[0.98]">
                        <Send size={14} strokeWidth={2} />
                        生成视频
                      </button>
                    </div>
                  </div>
                </section>

                <GenerationHistory shot={selectedShot} />
              </div>
            )}

            <div className="shrink-0 border-t border-white/[0.12] bg-[#101010] px-5 py-3">
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {shots.map((shot) => {
                  const active = selectedShot?.id === shot.id;
                  return (
                    <button
                      key={shot.id}
                      onClick={() => setSelectedShotId(shot.id)}
                      className="group w-[148px] shrink-0 text-left"
                    >
                      <div
                        className={`relative aspect-video overflow-hidden rounded-md border transition-all duration-200 ${
                          active
                            ? "border-[#00CAE0]/70 ring-2 ring-[#00CAE0]/20"
                            : "border-white/[0.12] group-hover:border-white/[0.24]"
                        }`}
                      >
                        <VideoPreview shot={shot} compact />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-2 py-1">
                          <span className="text-[10px] font-medium text-white">
                            镜头 {shot.number}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                              shot.hasVideo
                                ? "bg-[#00CAE0]/20 text-[#8ff5ff]"
                                : "bg-white/[0.12] text-[#b8b8b8]"
                            }`}
                          >
                            {shot.hasVideo ? "已生成" : "待生成"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-1 text-[11px] text-[#8f8f8f] group-hover:text-[#b8b8b8]">
                        {shot.description || "空镜头"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
