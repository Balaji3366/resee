import { useCallback, useState } from "react";

/**
 * A small loading-boolean helper — `withLoading` wraps an async action
 * so callers don't need to hand-write their own try/finally around
 * `setLoading(true)`/`setLoading(false)`.
 */
export function useLoading(initial = false) {
  const [isLoading, setIsLoading] = useState(initial);

  const start = useCallback(() => setIsLoading(true), []);
  const stop = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(async <T>(action: () => Promise<T>): Promise<T> => {
    setIsLoading(true);

    try {
      return await action();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, start, stop, withLoading };
}
