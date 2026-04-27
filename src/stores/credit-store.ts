import { create } from "zustand";
import { creditsApi } from "@/lib/api";

interface CreditState {
  balance: number;
  isLoading: boolean;
  fetchBalance: () => Promise<void>;
}

export const useCreditStore = create<CreditState>((set) => ({
  balance: 0,
  isLoading: false,

  async fetchBalance() {
    set({ isLoading: true });
    try {
      const data = await creditsApi.fetchCreditBalance();
      const balance = typeof data === "object" && data !== null
        ? (data as Record<string, unknown>).balance as number ?? 0
        : 0;
      set({ balance });
    } catch {
      // silently ignore — credit display is non-critical
    } finally {
      set({ isLoading: false });
    }
  },
}));
