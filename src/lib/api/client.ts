import { API_BASE_URL } from "@/lib/config";
import { ApiError } from "./errors";
import type { ApiResult, RefreshTokenRequest, LoginResponse } from "./types";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tenantId: number | null = null;
let signKey: string | null = null;

let onAuthFailure: (() => void) | null = null;

export function setOnAuthFailure(cb: () => void) {
  onAuthFailure = cb;
}

export function setApiClientTokens(access: string, refresh: string, key?: string) {
  accessToken = access;
  refreshToken = refresh;
  if (key) signKey = key;
}

export function clearApiClientTokens() {
  accessToken = null;
  refreshToken = null;
  signKey = null;
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

// ---------- Request signing (HMAC-SHA256) ----------

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hmacSHA256(key: string, message: string): string {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);
  const hmacAlgo = { name: "HMAC", hash: "SHA-256" };
  // We need sync HMAC, but WebCrypto is async.
  // Use a simple pure-JS fallback since this runs client-side only.
  return hmacSha256Sync(keyData, msgData);
}

// Minimal HMAC-SHA256 (sync, pure JS) — avoids async WebCrypto overhead per request.
function hmacSha256Sync(key: Uint8Array, message: Uint8Array): string {
  // SHA-256 compression using SubtleCrypto is async; use a compact inline implementation.
  // For simplicity, we leverage the fact that all modern browsers support crypto.subtle,
  // but since we need sync — we use a JS SHA-256 implementation.
  return sha256HmacHex(key, message);
}

// -- Compact SHA-256 + HMAC (pure sync JS) --

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
function ch(x: number, y: number, z: number) { return ((x & y) ^ (~x & z)) >>> 0; }
function maj(x: number, y: number, z: number) { return ((x & y) ^ (x & z) ^ (y & z)) >>> 0; }
function sigma0(x: number) { return (rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22)) >>> 0; }
function sigma1(x: number) { return (rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25)) >>> 0; }
function gamma0(x: number) { return (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0; }
function gamma1(x: number) { return (rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10)) >>> 0; }

function sha256(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const msgLen = data.length;
  const padded = new Uint8Array(Math.ceil((msgLen + 9) / 64) * 64);
  padded.set(data);
  padded[msgLen] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, msgLen * 8, false);
  const w = new Uint32Array(64);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) w[i] = (gamma1(w[i - 2]) + w[i - 7] + gamma0(w[i - 15]) + w[i - 16]) >>> 0;
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + sigma1(e) + ch(e, f, g) + K[i] + w[i]) >>> 0;
      const t2 = (sigma0(a) + maj(a, b, c)) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, h0, false); ov.setUint32(4, h1, false); ov.setUint32(8, h2, false); ov.setUint32(12, h3, false);
  ov.setUint32(16, h4, false); ov.setUint32(20, h5, false); ov.setUint32(24, h6, false); ov.setUint32(28, h7, false);
  return out;
}

function sha256HmacHex(key: Uint8Array, msg: Uint8Array): string {
  const blockLen = 64;
  let k = key;
  if (k.length > blockLen) k = sha256(k);
  const padded = new Uint8Array(blockLen);
  padded.set(k);
  const ipad = new Uint8Array(blockLen);
  const opad = new Uint8Array(blockLen);
  for (let i = 0; i < blockLen; i++) {
    ipad[i] = padded[i] ^ 0x36;
    opad[i] = padded[i] ^ 0x5c;
  }
  const inner = new Uint8Array(blockLen + msg.length);
  inner.set(ipad); inner.set(msg, blockLen);
  const innerHash = sha256(inner);
  const outer = new Uint8Array(blockLen + 32);
  outer.set(opad); outer.set(innerHash, blockLen);
  const result = sha256(outer);
  return Array.from(result, (b) => b.toString(16).padStart(2, "0")).join("");
}

function buildCanonicalQuery(params?: Record<string, string>): string {
  if (!params) return "";
  const items = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return items.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}

function buildCanonicalString(method: string, path: string, query: string, tid: string, ts: string, nonce: string): string {
  return [method.toUpperCase(), path, query, tid, ts, nonce].join("\n");
}

function buildSignHeaders(method: string, path: string, params?: Record<string, string>): Record<string, string> {
  if (!signKey) return {};
  const ts = String(Math.floor(Date.now() / 1000));
  const nonce = generateNonce();
  const query = buildCanonicalQuery(params);
  const tid = tenantId != null ? String(tenantId) : "";
  const canonical = buildCanonicalString(method, path, query, tid, ts, nonce);
  const sign = sha256HmacHex(new TextEncoder().encode(signKey), new TextEncoder().encode(canonical));
  return { "X-Timestamp": ts, "X-Nonce": nonce, "X-Sign": sign };
}

// ---------- Auth ----------

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
  signKey = result.data.signKey;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("sd2_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.accessToken = newAccess;
        parsed.refreshToken = result.data.refreshToken;
        parsed.signKey = result.data.signKey;
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

// ---------- Core request ----------

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

  const signHeaders = buildSignHeaders(method, path, params);
  Object.assign(headers, signHeaders);

  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status >= 400) {
    const errText = await res.text();
    console.error(`[API] ${method} ${path} → ${res.status}`, errText.slice(0, 500));

    let errBody: Record<string, unknown> | null = null;
    try { errBody = JSON.parse(errText); } catch {}

    const detail = errBody?.detail as Record<string, unknown> | undefined;
    const bizCode = (detail?.bizCode ?? errBody?.bizCode) as string | undefined;
    const errMessage = (detail?.message ?? errBody?.message ?? `HTTP ${res.status}`) as string;

    if (res.status === 401 && bizCode === "AUTH_TOKEN_EXPIRED" && refreshToken) {
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

    if (res.status === 401) {
      onAuthFailure?.();
    }
    throw new ApiError(res.status, errMessage, bizCode);
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
