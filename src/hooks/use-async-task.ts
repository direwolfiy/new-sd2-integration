"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type AsyncTaskStatus = "idle" | "pending" | "running" | "completed" | "failed";

interface UseAsyncTaskReturn {
  status: AsyncTaskStatus;
  taskId: string | null;
  error: string | null;
  submit: (submitFn: () => Promise<string>) => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL_MIN = 2000;
const POLL_INTERVAL_MAX = 10000;
const POLL_BACKOFF = 1.5;

export function useAsyncTask(
  pollFn: (taskId: string) => Promise<{ status: string; data?: unknown }>,
): UseAsyncTaskReturn {
  const [status, setStatus] = useState<AsyncTaskStatus>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayRef = useRef(POLL_INTERVAL_MIN);

  const clearPoll = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(
    (id: string) => {
      clearPoll();
      const tick = async () => {
        try {
          const result = await pollFn(id);
          if (result.status === "COMPLETED" || result.status === "completed") {
            setStatus("completed");
            return;
          }
          if (result.status === "FAILED" || result.status === "failed") {
            setStatus("failed");
            setError("任务执行失败");
            return;
          }
        } catch {
          // network error — keep polling
        }
        delayRef.current = Math.min(
          delayRef.current * POLL_BACKOFF,
          POLL_INTERVAL_MAX,
        );
        intervalRef.current = setTimeout(tick, delayRef.current);
      };
      tick();
    },
    [pollFn, clearPoll],
  );

  useEffect(() => {
    return () => clearPoll();
  }, [clearPoll]);

  const submit = useCallback(
    async (submitFn: () => Promise<string>) => {
      setStatus("pending");
      setError(null);
      try {
        const id = await submitFn();
        setTaskId(id);
        setStatus("running");
        delayRef.current = POLL_INTERVAL_MIN;
        poll(id);
      } catch (err) {
        setStatus("failed");
        setError(err instanceof Error ? err.message : "提交任务失败");
      }
    },
    [poll],
  );

  const reset = useCallback(() => {
    clearPoll();
    setStatus("idle");
    setTaskId(null);
    setError(null);
  }, [clearPoll]);

  return { status, taskId, error, submit, reset };
}
