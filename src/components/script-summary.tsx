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
      <div className="rounded-lg border border-white/[0.12] bg-[#181818] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-[#00CAE0]/10 text-[11px] text-[#00CAE0] font-medium">
            {metadata.genre}
          </span>
          <span className="text-[12px] text-[#a3a3a3]">
            {metadata.episodeCount} 集 · {metadata.totalWordCount.toLocaleString()} 字
          </span>
        </div>
        <p className="text-[13px] text-[#b8b8b8] leading-[1.7]">
          {metadata.summary}
        </p>
        {metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {metadata.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.08] text-[11px] text-[#a3a3a3]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Episodes */}
      <div>
        <p className="text-[12px] text-[#a3a3a3] font-medium mb-2.5">分集预览</p>
        <div className="space-y-2">
          {episodes.map((ep) => (
            <div
              key={ep.episodeNumber}
              className="rounded-lg border border-white/[0.12] bg-[#181818] p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#b8b8b8] tabular-nums">
                    {String(ep.episodeNumber).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] font-medium">{ep.title}</span>
                </div>
                <span className="text-[11px] text-[#b8b8b8]">{ep.wordCount} 字</span>
              </div>
              <p className="text-[12px] text-[#b8b8b8] leading-[1.7] line-clamp-2">
                {ep.summary}
              </p>
              {ep.characters.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users size={12} strokeWidth={1.5} className="text-[#b8b8b8] shrink-0" />
                  <span className="text-[11px] text-[#b8b8b8]">{ep.characters.join("、")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
