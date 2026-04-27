import { post } from "./client";
import type { LoginResponse } from "./types";

export function login(username: string, password: string) {
  return post<LoginResponse>("/admin-user/login", { username, password });
}

export function refreshToken(refreshToken: string) {
  return post<LoginResponse>("/admin-user/refresh-token", { refreshToken });
}

export function logout() {
  return post<boolean>("/admin-user/logout");
}
