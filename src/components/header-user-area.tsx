"use client";

import { useEffect } from "react";
import { Bell, Coins } from "lucide-react";
import { useCreditStore } from "@/stores/credit-store";
import { formatCredits } from "@/lib/pricing";

export function HeaderUserArea() {
  const { balance, fetchBalance } = useCreditStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-[#262626] cursor-pointer hover:bg-[#333] transition-colors duration-200">
        <Coins size={13} strokeWidth={1.5} className="text-[#00CAE0]" />
        <span className="text-[12px] text-white font-medium tabular-nums leading-none">
          {formatCredits(balance)}
        </span>
      </div>
      <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
        <Bell size={16} strokeWidth={1.5} />
      </button>
      <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[13px] text-white font-medium cursor-pointer hover:bg-[#444] transition-colors duration-200">
        张
      </div>
    </div>
  );
}
