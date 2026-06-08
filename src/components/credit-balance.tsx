"use client";

import { useEffect } from "react";
import { Coins } from "lucide-react";
import { useCreditStore } from "@/stores/credit-store";
import { formatCredits } from "@/lib/pricing";

export function CreditBalance() {
  const { balance, fetchBalance } = useCreditStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-[#2b2b2b] hover:bg-[#333] cursor-pointer transition-colors duration-200">
      <Coins size={14} strokeWidth={1.5} className="text-[#00CAE0]" />
      <span className="text-[13px] text-white font-medium tabular-nums">
        {formatCredits(balance)}
      </span>
    </div>
  );
}
