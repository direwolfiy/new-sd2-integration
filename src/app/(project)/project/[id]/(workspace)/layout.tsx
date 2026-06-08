"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Layers, List, Sparkles, Settings } from "lucide-react";
import { projectsApi, useApi } from "@/lib/api";
import { HeaderUserArea } from "@/components/header-user-area";

const tabs = [
  { href: "/elements", label: "元素库", icon: Layers },
  { href: "/episodes", label: "分集管理", icon: List },
  { href: "/workshop", label: "工坊", icon: Sparkles },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { data: project } = useApi(() => projectsApi.fetchProject(projectId), [projectId]);
  const projectName = project?.title ?? "项目";

  const basePath = `/project/${projectId}`;

  function isActive(tabHref: string) {
    const fullPath = basePath + tabHref;
    if (tabHref === "") return pathname === basePath;
    return pathname.startsWith(fullPath);
  }

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 shrink-0 flex items-center px-4 border-b border-white/[0.12] bg-[#0a0a0a] relative">
        <div className="flex items-center gap-2 pr-3 border-r border-white/[0.12]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00CAE0]" />
            <span className="text-[15px] text-white font-medium">SD2</span>
          </Link>
        </div>
        <div className="flex items-center px-3 border-r border-white/[0.12]">
          <span className="text-[13px] text-white">{projectName}</span>
          <Link
            href={`${basePath}/settings`}
            className="ml-1.5 w-6 h-6 rounded-md flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/[0.10] transition-colors duration-200"
          >
            <Settings size={14} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={basePath + tab.href}
              className={`px-3 h-7 flex items-center gap-1.5 text-[13px] rounded-md transition-colors duration-200 ${
                isActive(tab.href)
                  ? "bg-white/[0.08] text-white"
                  : "text-[#a3a3a3] hover:text-[#b8b8b8]"
              }`}
            >
              <tab.icon size={14} strokeWidth={1.5} />
              {tab.label}
            </Link>
          ))}
        </div>
        <HeaderUserArea />
      </header>
      <main className="flex-1 overflow-auto bg-[#0a0a0a]">{children}</main>
    </div>
  );
}
