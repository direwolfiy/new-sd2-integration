"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ open, onConfirm, onCancel }: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[360px] rounded-xl border border-white/[0.08] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} strokeWidth={1.5} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-medium">确认删除</h3>
          </div>
          <p className="text-[13px] text-[#999] leading-[1.7]">确定要删除该元素吗？此操作无法撤销。</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.06]">
          <button onClick={onCancel} className="h-9 px-4 rounded-full bg-white/[0.06] text-[13px] text-[#999] hover:bg-white/[0.1] hover:text-white transition-colors duration-200">取消</button>
          <button onClick={onConfirm} className="h-9 px-5 rounded-full bg-red-500/90 text-white text-[13px] font-medium hover:bg-red-500 active:scale-[0.97] transition-all duration-200">删除</button>
        </div>
      </div>
    </div>
  );
}
