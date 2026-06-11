"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Package,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "首页", icon: Home },
  { href: "/", label: "项目", icon: LayoutGrid, match: (p: string) => p === "/" || p === "/project/new" },
  { href: "/assets", label: "资产", icon: Package, match: (p: string) => p.startsWith("/assets") },
  { label: "团队", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="pointer-events-none fixed bottom-0 left-0 top-14 z-30 hidden w-24 px-3 pt-5 md:flex md:flex-col md:items-center">
      <nav className="pointer-events-auto fixed left-3 top-1/2 flex -translate-y-1/2 flex-col gap-1.5 rounded-[28px] border border-white/[0.12] bg-black/35 p-2 shadow-lg shadow-black/25 backdrop-blur-xl">
        {navItems.map((item) => {
          const active = item.match?.(pathname) ?? false;
          const itemClass = cn(
            "group relative flex h-16 w-14 flex-col items-center justify-center gap-1.5 rounded-2xl text-xs leading-none transition-colors duration-200",
            active
              ? "text-white"
              : item.href
                ? "text-[#b8b8b8] hover:text-white"
                : "cursor-default text-[#777]",
          );

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={itemClass}
              aria-current={active ? "page" : undefined}
            >
              <item.icon
                size={active ? 22 : 20}
                strokeWidth={1.5}
                className="shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
              <span className={active ? "font-medium" : "font-normal"}>{item.label}</span>
              {active ? (
                <span className="absolute left-1 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-[#00CAE0]" />
              ) : null}
            </Link>
          ) : (
            <div key={item.label} className={itemClass} aria-label={`${item.label}（占位）`}>
              <item.icon size={20} strokeWidth={1.5} className="shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
