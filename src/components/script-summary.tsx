"use client";

import { Users } from "lucide-react";
import { ScriptMetadata, ScriptEpisode } from "@/mocks/types";

interface Props {
  metadata: ScriptMetadata;
  episodes: ScriptEpisode[];
}

export function ScriptSummary({ metadata, episodes }: Props) {
  return (
    <div className="space-y-4">
      {/* Metadata */}
      <div className="rounded-lg border border-white/[0.06] bg-[#141414] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-[#00CAE0]/10 text-[11px] text-[#00CAE0] font-medium">
            {metadata.genre}
          </span>
          <span className="text-[12px] text-[#666]">
            {metadata.episodeCount} 集 · {metadata.totalWordCount.toLocaleString()} 字
          </span>
        </div>
        <p className="text-[13px] text-[#999] leading-[1.7]">
          {metadata.summary}
        </p>
        {metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {metadata.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.04] text-[11px] text-[#666]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Episodes */}
      <div>
        <p className="text-[12px] text-[#666] font-medium mb-2.5">分集预览</p>
        <div className="space-y-2">
          {episodes.map((ep) => (
            <div
              key={ep.episodeNumber}
              className="rounded-lg border border-white/[0.06] bg-[#141414] p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#555] tabular-nums">
                    {String(ep.episodeNumber).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] font-medium">{ep.title}</span>
                </div>
                <span className="text-[11px] text-[#555]">{ep.wordCount} 字</span>
              </div>
              <p className="text-[12px] text-[#999] leading-[1.7] line-clamp-2">
                {ep.summary}
              </p>
              {ep.characters.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users size={12} strokeWidth={1.5} className="text-[#555] shrink-0" />
                  <span className="text-[11px] text-[#555]">{ep.characters.join("、")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
