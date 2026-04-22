"use client";

import { Coins } from "lucide-react";
import { currentUserCredits, formatCredits } from "@/mocks/credits";

export function CreditBalance() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-[#262626] hover:bg-[#333] cursor-pointer transition-colors duration-200">
      <Coins size={14} strokeWidth={1.5} className="text-[#00CAE0]" />
      <span className="text-[13px] text-white font-medium tabular-nums">
        {formatCredits(currentUserCredits.balance)}
      </span>
    </div>
  );
}
