import { create } from "zustand";
import { AUTH_STORAGE_KEY } from "@/lib/config";
import { authApi } from "@/lib/api";
import {
  setApiClientTokens,
  clearApiClientTokens,
  setTenantId as setApiClientTenantId,
  setOnAuthFailure,
} from "@/lib/api/client";

interface AuthUser {
  id: number;
  username: string;
  nickName?: string;
}

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  signKey: string;
  user: AuthUser;
  tenantId: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  isInitialized: boolean;

  initialize: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTenant: (tenantId: string) => void;
}

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(data: StoredAuth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  tenantId: null,
  isInitialized: false,

  initialize() {
    const stored = readStoredAuth();
    if (stored) {
      setApiClientTokens(stored.accessToken, stored.refreshToken, stored.signKey);
      if (stored.tenantId != null) setApiClientTenantId(stored.tenantId);
      set({
        user: stored.user,
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        tenantId: stored.tenantId,
        isInitialized: true,
      });
    } else {
      set({ isInitialized: true });
    }
  },

  async login(username: string, password: string) {
    const data = await authApi.login(username, password);
    const user: AuthUser = {
      id: data.id,
      username: data.username,
      nickName: data.nickName,
    };
    const tenantId = data.lastActiveTenantId ?? data.defaultTenantId ?? null;

    setApiClientTokens(data.accessToken, data.refreshToken, data.signKey);
    if (tenantId != null) setApiClientTenantId(tenantId);

    writeStoredAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      signKey: data.signKey,
      user,
      tenantId,
    });

    set({
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tenantId,
    });
  },

  async logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore logout API errors
    }
    clearApiClientTokens();
    clearStoredAuth();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
    });
  },

  setTenant(tenantId: string) {
    setApiClientTenantId(tenantId);
    set({ tenantId });
    const stored = readStoredAuth();
    if (stored) {
      stored.tenantId = tenantId;
      writeStoredAuth(stored);
    }
  },
}));

setOnAuthFailure(() => {
  useAuthStore.getState().logout();
});
