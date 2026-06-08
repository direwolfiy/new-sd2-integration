"use client";

import { useState } from "react";
import { ArrowLeft, Save, Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { projectsApi, useApi } from "@/lib/api";

export default function SettingsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: project, isLoading } = useApi(() => projectsApi.fetchProject(id), [id]);
  const basePath = `/project/${id}`;
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="h-6 bg-[#222] rounded animate-pulse w-32" />
          <div className="space-y-3">
            <div className="h-10 bg-[#222] rounded-lg animate-pulse" />
            <div className="h-24 bg-[#222] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href={basePath}
            className="flex items-center gap-1.5 text-[13px] text-[#b8b8b8] hover:text-white transition-colors duration-200 shrink-0"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            返回
          </Link>
          <div className="w-px h-5 bg-white/[0.10]" />
          <h2 className="text-lg font-medium tracking-[-0.01em]">
            项目设置
          </h2>
        </div>

        <div className="space-y-4">
          <h3 className="text-[13px] font-medium text-[#b8b8b8] uppercase tracking-wider">基本信息</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[13px] text-[#a3a3a3] mb-1.5 block">项目名称</label>
              <input
                type="text"
                defaultValue={project?.title}
                className="w-full h-10 px-4 rounded-lg bg-[#2b2b2b] border border-white/[0.14] text-white text-[15px] focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] outline-none transition-colors duration-200"
              />
            </div>
            <div>
              <label className="text-[13px] text-[#a3a3a3] mb-1.5 block">项目描述</label>
              <textarea
                defaultValue={project?.summary ?? ""}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[#2b2b2b] border border-white/[0.14] text-white text-[15px] leading-[1.8] focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] outline-none transition-colors duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[13px] font-medium text-[#b8b8b8] uppercase tracking-wider">风格预设</h3>
          <div className="p-4 rounded-lg bg-[#181818] border border-white/[0.12] space-y-2">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[12px] text-[#a3a3a3]">创作类型</p>
                <p className="text-[15px]">{project?.videoCreateBusinessType ?? "—"}</p>
              </div>
              <div className="w-px h-8 bg-white/[0.10]" />
              <div>
                <p className="text-[12px] text-[#a3a3a3]">题材</p>
                <p className="text-[15px]">{project?.style ?? "—"}</p>
              </div>
            </div>
            <p className="text-[12px] text-[#a3a3a3] leading-[1.6]">
              更换风格预设不影响已有素材，新创建的元素会默认使用新风格。
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[13px] font-medium text-[#b8b8b8] uppercase tracking-wider">参数配置</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "画面比例", value: project?.videoAspectRatio ?? "16:9" },
              { label: "分辨率", value: "1080p" },
              { label: "帧率", value: "24fps" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-[#2b2b2b] border border-white/[0.14]">
                <p className="text-[12px] text-[#a3a3a3]">{item.label}</p>
                <p className="text-[15px] mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium text-[#b8b8b8] uppercase tracking-wider">团队成员</h3>
            <button className="text-[13px] text-[#b8b8b8] hover:text-white transition-colors duration-200">
              添加成员
            </button>
          </div>
          <div className="space-y-1">
            {project?.producerName && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#181818] border border-white/[0.12]">
                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[13px] text-white font-medium">
                  {project.producerName[0]}
                </div>
                <span className="text-[15px] flex-1">{project.producerName}</span>
                <span className="text-[13px] text-[#a3a3a3]">制作人</span>
              </div>
            )}
            {!project?.producerName && (
              <p className="text-[13px] text-[#a3a3a3] py-4 text-center">暂无团队成员</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className={`h-10 px-6 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-all duration-200 ${
              saved
                ? "bg-[#00CAE0]/10 text-[#00CAE0] border border-[#00CAE0]/20"
                : "bg-white text-black hover:bg-white/90 active:scale-[0.97]"
            }`}
          >
            {saved ? (
              <>
                <Check size={14} strokeWidth={2} />
                已保存
              </>
            ) : (
              <>
                <Save size={14} strokeWidth={2} />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
