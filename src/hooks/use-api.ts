"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const hasToken = useAuthStore((s) => s.accessToken !== null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetcher();
      setData(next);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, String(err)));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!isInitialized) return;
    if (!hasToken) { setIsLoading(false); return; }
    fetch();
  }, [fetch, isInitialized, hasToken]);

  return { data, isLoading, error, refetch: fetch };
}
