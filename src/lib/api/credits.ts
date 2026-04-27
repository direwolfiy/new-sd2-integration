import { get } from "./client";
import type { TenantAccountOverview } from "./types";

export function fetchCreditBalance() {
  return get<TenantAccountOverview>("/system/tenant-account/current");
}

export function fetchMyTenants() {
  return get<unknown[]>("/system/tenant-account/my-tenants");
}
