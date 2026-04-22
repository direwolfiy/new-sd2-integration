"use client";

import Link from "next/link";
import { Plus, LayoutGrid, List, Search, Filter, FolderMinus, MoreVertical } from "lucide-react";
import { projects } from "@/mocks/projects";

function ProjectCard({
  project,
}: {
  project: (typeof projects)[number];
}) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group relative block h-[188px] w-full rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      {/* 背景图层 */}
      <div className="absolute inset-0 bg-[#262626]">
        <div className="absolute inset-0 flex items-center justify-center">
          <FolderMinus size={32} strokeWidth={1.5} className="text-white/10" />
        </div>
      </div>

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      {/* 顶部操作区 */}
      <div className="absolute top-0 right-0 left-0 flex items-start justify-between p-2">
        <div className="p-1">
          <div className="flex size-6 items-center justify-center rounded bg-white/10">
            <FolderMinus size={14} strokeWidth={1.5} className="text-white/90" />
          </div>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/90 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white/20"
        >
          <MoreVertical size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* 底部信息区 — 仅项目名 */}
      <div className="absolute right-0 bottom-0 left-0 p-3">
        <p className="truncate text-sm font-medium text-white drop-shadow-sm">
          {project.name}
        </p>
      </div>
    </Link>
  );
}

export default function ProjectListPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-medium tracking-[-0.01em]">
            我的项目
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-8 px-3 rounded-full bg-[#262626] flex items-center gap-2 text-[13px] text-[#666]">
              <Search size={14} strokeWidth={1.5} />
              搜索项目...
            </div>
            <button className="h-8 px-3 rounded-full bg-white/[0.06] flex items-center gap-1.5 text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">
              <Filter size={14} strokeWidth={1.5} />
              筛选
            </button>
            <div className="flex gap-1 bg-white/[0.04] rounded-md p-0.5">
              <button className="p-1.5 rounded bg-white/[0.08] text-white">
                <LayoutGrid size={14} strokeWidth={1.5} />
              </button>
              <button className="p-1.5 rounded text-[#666] hover:text-[#999] transition-colors duration-200">
                <List size={14} strokeWidth={1.5} />
              </button>
            </div>
            <Link
              href="/project/new"
              className="h-8 px-4 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
            >
              <Plus size={14} strokeWidth={2} />
              新建项目
            </Link>
          </div>
        </div>

        {/* 项目网格 */}
        <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {/* 新建项目占位卡片 — 放在网格首位 */}
          <Link
            href="/project/new"
            className="group relative flex h-[188px] items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-transparent hover:border-white/[0.2] hover:bg-white/[0.02] transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-2 text-[#666] group-hover:text-white transition-colors duration-200">
              <Plus size={24} strokeWidth={1.5} />
              <span className="text-[13px]">新建项目</span>
            </div>
          </Link>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
