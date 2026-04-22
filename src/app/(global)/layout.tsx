import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { CreditBalance } from "@/components/credit-balance";

function TopBar() {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#0a0a0a]">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#00CAE0]" />
        <span className="text-[15px] font-medium tracking-tight">SD2</span>
      </Link>
      <div className="flex items-center gap-3">
        <CreditBalance />
        <div className="h-8 px-3 rounded-full bg-[#262626] flex items-center gap-2 text-[13px] text-[#666] cursor-pointer hover:bg-[#333] transition-colors duration-200">
          <Search size={14} strokeWidth={1.5} />
          <span>搜索...</span>
        </div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
          <Bell size={16} strokeWidth={1.5} />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[13px] text-white font-medium">
          张
        </div>
      </div>
    </header>
  );
}

export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-[#0a0a0a] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
