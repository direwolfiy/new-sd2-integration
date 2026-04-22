"use client";

import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { getAssetsByType } from "@/mocks/assets";
import { AssetType } from "@/mocks/types";

const typeFilters: { key: AssetType | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "image", label: "图片" },
  { key: "video", label: "视频" },
  { key: "audio", label: "音频" },
];

const typeLabels: Record<AssetType, string> = {
  image: "图片",
  video: "视频",
  audio: "音频",
};

export default function AssetsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const assets = getAssetsByType(activeFilter);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-xl font-medium tracking-[-0.01em]">
          全局资产库
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-8 px-3 rounded-full bg-[#262626] flex items-center gap-2 text-[13px] text-[#666]">
            <Search size={14} strokeWidth={1.5} />
            搜索资产...
          </div>
          <button className="h-8 px-3 rounded-full bg-white/[0.06] flex items-center gap-1.5 text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
            <Filter size={14} strokeWidth={1.5} />
            筛选
          </button>
          <button className="h-8 px-4 rounded-full bg-white/[0.06] text-white text-[13px] flex items-center gap-1.5 hover:bg-white/[0.1] transition-colors duration-200">
            <Plus size={14} strokeWidth={1.5} />
            上传资产
          </button>
        </div>
      </div>

      {/* 类型筛选 */}
      <div className="flex items-center gap-1 mb-6">
        {typeFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 h-7 text-[13px] rounded-md transition-colors duration-200 ${
              activeFilter === filter.key
                ? "bg-white/[0.08] text-white"
                : "text-[#666] hover:text-[#999]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 资产网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="group rounded-lg border border-white/[0.06] bg-[#141414] overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
          >
            <div className="aspect-video bg-[#262626] flex items-center justify-center text-[#666] text-[12px]">
              {asset.name}
            </div>
            <div className="p-3 space-y-1.5">
              <p className="text-[13px] font-medium truncate">{asset.name}</p>
              <div className="flex items-center justify-between text-[11px] text-[#666]">
                <span className="px-1.5 py-0.5 rounded-full bg-white/[0.04]">
                  {typeLabels[asset.type]}
                </span>
                <span>{asset.sourceProject}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
