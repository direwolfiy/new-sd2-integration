import { API_BASE_URL } from "@/lib/config";
import { ApiError } from "./errors";
import type { LoginResponse, ApiResult } from "./types";

function safeParseLoginResponse(raw: string): LoginResponse {
  const safe = raw.replace(
    /"(defaultTenantId|lastActiveTenantId)":(\d{15,})/g,
    '"$1":"$2"',
  );
  const result: ApiResult<LoginResponse> = JSON.parse(safe);
  if (result.code !== 200 || !result.data) {
    throw new ApiError(result.code, result.message, result.bizCode);
  }
  return result.data;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/admin-user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const raw = await res.text();
  if (res.status >= 400) {
    let errBody: Record<string, unknown> | null = null;
    try { errBody = JSON.parse(raw); } catch {}
    throw new ApiError(res.status, (errBody?.message ?? `HTTP ${res.status}`) as string);
  }
  return safeParseLoginResponse(raw);
}

export async function refreshTokenRequest(token: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/admin-user/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  });
  const raw = await res.text();
  if (res.status >= 400) {
    let errBody: Record<string, unknown> | null = null;
    try { errBody = JSON.parse(raw); } catch {}
    throw new ApiError(res.status, (errBody?.message ?? `HTTP ${res.status}`) as string);
  }
  return safeParseLoginResponse(raw);
}

export function logout() {
  return fetch(`${API_BASE_URL}/admin-user/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then(() => true);
}
