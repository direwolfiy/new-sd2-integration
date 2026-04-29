import { create } from "zustand";
import { creditsApi } from "@/lib/api";

interface CreditState {
  balance: string;
  isLoading: boolean;
  fetchBalance: () => Promise<void>;
}

export const useCreditStore = create<CreditState>((set) => ({
  balance: "0",
  isLoading: false,

  async fetchBalance() {
    set({ isLoading: true });
    try {
      const data = await creditsApi.fetchCreditBalance();
      set({ balance: data?.availableBalance ?? "0" });
    } catch {
      // silently ignore — credit display is non-critical
    } finally {
      set({ isLoading: false });
    }
  },
}));
