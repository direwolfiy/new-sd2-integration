"use client";

import { X, Coins, ArrowRight } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  required: number;
  current: number;
}

export function CreditInsufficientModal({ open, onClose, required, current }: Props) {
  if (!open) return null;

  const deficit = required - current;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[400px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-[15px] font-medium">积分不足</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-[12px] text-[#666] mb-1">当前余额</p>
              <p className="text-[24px] font-medium tabular-nums">{current.toLocaleString()}</p>
            </div>
            <ArrowRight size={20} strokeWidth={1.5} className="text-[#444]" />
            <div className="text-center">
              <p className="text-[12px] text-[#666] mb-1">所需积分</p>
              <p className="text-[24px] font-medium text-[#00CAE0] tabular-nums">{required.toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-lg bg-[#262626] px-4 py-3 mb-5">
            <p className="text-[13px] text-[#999] leading-[1.6]">
              还差 <span className="text-white font-medium">{deficit.toLocaleString()}</span> 积分才能完成本次生成。充值后即可继续使用 AI 生成功能。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200"
            >
              取消
            </button>
            <button className="flex-1 h-10 rounded-full bg-white text-black text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200">
              <Coins size={14} strokeWidth={2} />
              去充值
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
