import { get } from "./client";

export function fetchCreditBalance() {
  return get<unknown>("/system/tenant-account/balance");
}
