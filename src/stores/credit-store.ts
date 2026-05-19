import { create } from "zustand";
import { creditsApi } from "@/lib/api";

interface CreditState {
  balance: string;
  isLoading: boolean;
  _initialized: boolean;
  fetchBalance: () => Promise<void>;
}

export const useCreditStore = create<CreditState>((set, get) => ({
  balance: "0",
  isLoading: false,
  _initialized: false,

  async fetchBalance() {
    if (get()._initialized || get().isLoading) return;
    set({ isLoading: true });
    try {
      const data = await creditsApi.fetchCreditBalance();
      set({ balance: data?.availableBalance ?? "0", _initialized: true });
    } catch {
      // silently ignore — credit display is non-critical
    } finally {
      set({ isLoading: false });
    }
  },
}));
