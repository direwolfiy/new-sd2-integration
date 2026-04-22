"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Check } from "lucide-react";
import Link from "next/link";

const creativeTypes = ["2D 动漫", "3D 动漫", "真人"];
const genreTypes = ["古风", "现代", "科幻", "仙侠", "校园", "悬疑", "搞笑"];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creativeType, setCreativeType] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);

  const canCreate = name.trim() && creativeType && genre;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#999] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </Link>
        <h1 className="font-heading text-xl font-medium tracking-[-0.01em]">
          创建新项目
        </h1>
      </div>

      <div className="space-y-8">
        {/* 项目名称 */}
        <div className="space-y-3">
          <label className="text-[13px] font-medium text-[#999]">项目名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入项目名称"
            className="w-full h-10 px-4 rounded-lg bg-[#262626] border border-white/[0.08] text-white text-[15px] placeholder:text-white/30 focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] outline-none transition-colors duration-200"
          />
        </div>

        {/* 封面上传 */}
        <div className="space-y-3">
          <label className="text-[13px] font-medium text-[#999]">封面图（可选）</label>
          <div className="w-full aspect-[16/7] rounded-lg border border-dashed border-white/[0.12] bg-[#141414] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-white/[0.2] transition-colors duration-200">
            <Upload size={24} strokeWidth={1.5} className="text-[#666]" />
            <span className="text-[13px] text-[#666]">点击上传封面图</span>
          </div>
        </div>

        {/* 创作类型 */}
        <div className="space-y-3">
          <label className="text-[13px] font-medium text-[#999]">创作类型</label>
          <div className="flex gap-2">
            {creativeTypes.map((type) => (
              <button
                key={type}
                onClick={() => setCreativeType(type)}
                className={`h-10 px-5 rounded-full text-[13px] font-medium transition-colors duration-200 ${
                  creativeType === type
                    ? "bg-[#00CAE0]/10 text-[#00CAE0] border border-[#00CAE0]/15"
                    : "bg-white/[0.06] text-white border border-transparent hover:bg-white/[0.1]"
                }`}
              >
                {creativeType === type && <Check size={14} strokeWidth={2} className="inline mr-1.5 -mt-0.5" />}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 题材类型 */}
        <div className="space-y-3">
          <label className="text-[13px] font-medium text-[#999]">题材类型</label>
          <div className="flex flex-wrap gap-2">
            {genreTypes.map((type) => (
              <button
                key={type}
                onClick={() => setGenre(type)}
                className={`h-10 px-5 rounded-full text-[13px] font-medium transition-colors duration-200 ${
                  genre === type
                    ? "bg-[#00CAE0]/10 text-[#00CAE0] border border-[#00CAE0]/15"
                    : "bg-white/[0.06] text-white border border-transparent hover:bg-white/[0.1]"
                }`}
              >
                {genre === type && <Check size={14} strokeWidth={2} className="inline mr-1.5 -mt-0.5" />}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 风格预览 */}
        {creativeType && genre && (
          <div className="p-4 rounded-lg bg-[#141414] border border-white/[0.06] space-y-2">
            <p className="text-[13px] font-medium">风格预设</p>
            <p className="text-[13px] text-[#999] leading-[1.7]">
              {creativeType} × {genre} — 系统将自动匹配对应画风模板，新创建的元素默认使用此风格。
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-3 pt-4">
          <button
            disabled={!canCreate}
            onClick={() => router.push("/project/proj-1")}
            className="h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            创建项目
          </button>
          <Link
            href="/"
            className="h-10 px-6 rounded-full bg-white/[0.06] text-white text-[13px] flex items-center hover:bg-white/[0.1] transition-colors duration-200"
          >
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
