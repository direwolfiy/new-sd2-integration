"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api/errors";

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch((err) => {
        setError(err instanceof ApiError ? err : new ApiError(0, String(err)));
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
