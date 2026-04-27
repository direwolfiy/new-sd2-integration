import { API_BASE_URL } from "@/lib/config";
import { ApiError } from "./errors";
import type { ApiResult, RefreshTokenRequest, LoginResponse } from "./types";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tenantId: number | null = null;

let onAuthFailure: (() => void) | null = null;

export function setOnAuthFailure(cb: () => void) {
  onAuthFailure = cb;
}

export function setApiClientTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
}

export function clearApiClientTokens() {
  accessToken = null;
  refreshToken = null;
}

export function setTenantId(id: number | null) {
  tenantId = id;
}

export function getAccessToken() {
  return accessToken;
}

interface RequestOptions {
  body?: unknown;
  params?: Record<string, string>;
  signal?: AbortSignal;
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) throw new ApiError(401, "No refresh token available");

  const url = `${API_BASE_URL}/admin-user/refresh-token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken } satisfies RefreshTokenRequest),
  });

  const result: ApiResult<LoginResponse> = await res.json();
  if (result.code !== 200 || !result.data) {
    throw new ApiError(result.code, result.message, result.bizCode);
  }

  const newAccess = result.data.accessToken;
  accessToken = newAccess;
  refreshToken = result.data.refreshToken;

  // Notify auth store about the refreshed tokens
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("sd2_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.accessToken = newAccess;
        parsed.refreshToken = result.data.refreshToken;
        localStorage.setItem("sd2_auth", JSON.stringify(parsed));
      }
    } catch {}
  }

  return newAccess;
}

let refreshPromise: Promise<string> | null = null;

async function refreshOrWait(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, signal } = options;

  let url = `${API_BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  if (tenantId != null) headers["X-Tenant-Id"] = String(tenantId);

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 401) {
    const errBody = await res.json().catch(() => null);
    const bizCode = errBody?.detail?.bizCode ?? errBody?.bizCode;

    if (bizCode === "AUTH_TOKEN_EXPIRED" && refreshToken) {
      try {
        const newToken = await refreshOrWait();
        headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(url, {
          method,
          headers,
          body: body != null ? JSON.stringify(body) : undefined,
          signal,
        });
        const retryResult: ApiResult<T> = await retryRes.json();
        if (retryResult.code === 200) return retryResult.data as T;
        throw new ApiError(retryResult.code, retryResult.message, retryResult.bizCode);
      } catch (e) {
        if (e instanceof ApiError) throw e;
      }
    }

    onAuthFailure?.();
    throw new ApiError(401, errBody?.detail?.message ?? "认证失败", bizCode);
  }

  const result: ApiResult<T> = await res.json();

  if (result.code === 200) return result.data as T;

  throw new ApiError(result.code, result.message, result.bizCode);
}

export function get<T>(path: string, params?: Record<string, string>) {
  return request<T>("GET", path, { params });
}

export function post<T>(path: string, body?: unknown) {
  return request<T>("POST", path, { body });
}

export function put<T>(path: string, body?: unknown) {
  return request<T>("PUT", path, { body });
}

export function del<T>(path: string) {
  return request<T>("DELETE", path);
}
