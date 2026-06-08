"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  HelpCircle,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", label: "项目管理", icon: LayoutGrid, match: (p: string) => p === "/" || p === "/project/new" },
  { href: "/assets", label: "资产管理", icon: Package, match: (p: string) => p.startsWith("/assets") },
  { href: "/help", label: "帮助中心", icon: HelpCircle, match: (p: string) => p.startsWith("/help") },
  { href: "/feedback", label: "意见反馈", icon: MessageSquare, match: (p: string) => p.startsWith("/feedback") },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-white/[0.12] bg-[#0a0a0a] flex flex-col py-3 px-2">
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors duration-200 ${
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-[#b8b8b8] hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.12] my-2" />
      <Link
        href="/settings"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-[#b8b8b8] hover:text-white hover:bg-white/[0.07] transition-colors duration-200"
      >
        <Settings size={16} strokeWidth={1.5} />
        个人设置
      </Link>
      <div className="flex-1" />
      <Link
        href="/design-system"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-[#a3a3a3] hover:text-[#b8b8b8] hover:bg-white/[0.07] transition-colors duration-200"
      >
        <Sparkles size={16} strokeWidth={1.5} />
        设计系统
      </Link>
    </aside>
  );
}
