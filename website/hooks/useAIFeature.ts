import { useState } from "react";
import type { AIError } from "@/types/ai";

/**
 * The one generic hook every future AI feature route's client-side
 * caller uses — POSTs params to an AI feature endpoint and manages
 * loading/error/data state around the exact AIResponse<T> shape
 * runAIRequest() returns. No feature needs to hand-write this fetch/
 * loading/error dance itself.
 */
export function useAIFeature<TParams, TResult>(endpoint: string) {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<AIError | null>(null);
  const [loading, setLoading] = useState(false);

  async function execute(params: TParams): Promise<TResult | null> {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const json = await res.json();

      if (json.success) {
        setData(json.data as TResult);
        return json.data as TResult;
      }

      setError(json.error as AIError);
      return null;
    } catch {
      setError({
        code: "unknown",
        message: "Couldn't reach the AI service. Check your connection and try again.",
        retryable: true,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setData(null);
    setError(null);
  }

  return { data, error, loading, execute, reset };
}
