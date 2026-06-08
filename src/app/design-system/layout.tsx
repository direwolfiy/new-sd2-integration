import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "设计系统 — SD2",
};

const navItems = [
  { href: "/design-system", label: "基础样式" },
  { href: "/design-system/color", label: "色彩体系" },
  { href: "/design-system/icons", label: "图标系统" },
  { href: "/design-system/layout", label: "布局组件" },
  { href: "/design-system/motion", label: "动效系统" },
  { href: "/design-system/components", label: "交互组件" },
];

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.10]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[#b8b8b8] hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回首页</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-medium">设计系统</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-full text-[13px] text-[#b8b8b8] hover:text-white hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="pt-14">{children}</main>
    </div>
  );
}
