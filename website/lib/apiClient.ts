import { getCached, setCached } from "@/lib/clientCache";

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

export interface ApiClientResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
}

interface RequestOptions {
  signal?: AbortSignal;
  /** GET only — cache the parsed response for this many seconds via lib/clientCache.ts. */
  cacheTtlSeconds?: number;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status >= 500;
}

/**
 * Client-side request wrapper addressing the confirmed gap: every one
 * of the ~35 existing fetch-hooks (see hooks/useJobs.ts, useResumes.ts,
 * useProgressOverview.ts) hand-writes the same
 * try/catch/envelope-check with zero retry and zero cancellation. This
 * ships ready for new hooks to adopt — existing hooks are not migrated
 * to it in this pass. Retry policy mirrors the exact pattern already
 * proven in lib/ai/providers/gemini.ts: exponential backoff, gated to
 * 5xx/network failures only — never retries a 4xx, since retrying a bad
 * request or an auth failure can't succeed by trying again.
 */
async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<ApiClientResult<T>> {
  const cacheKey = `${method}:${url}`;

  if (method === "GET" && options.cacheTtlSeconds) {
    const cached = getCached<ApiClientResult<T>>(cacheKey);
    if (cached) return cached;
  }

  let lastResult: ApiClientResult<T> = { success: false, message: "Request failed.", status: 0 };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: options.signal,
      });

      const json = await res.json().catch(() => ({}));

      const result: ApiClientResult<T> = {
        success: res.ok && json.success !== false,
        data: json,
        message: json.message,
        status: res.status,
      };

      if (result.success) {
        if (method === "GET" && options.cacheTtlSeconds) {
          setCached(cacheKey, result, options.cacheTtlSeconds);
        }

        return result;
      }

      lastResult = result;

      if (!isRetryableStatus(res.status) || attempt === MAX_ATTEMPTS - 1) {
        return result;
      }
    } catch (error) {
      // Network failure (offline, DNS, CORS) — retryable, same as a 5xx.
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      lastResult = { success: false, message: "Network error. Check your connection.", status: 0 };

      if (attempt === MAX_ATTEMPTS - 1) {
        return lastResult;
      }
    }

    await wait(BASE_DELAY_MS * 2 ** attempt);
  }

  return lastResult;
}

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) => request<T>("GET", url, undefined, options),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", url, body, options),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", url, body, options),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>("DELETE", url, undefined, options),
};
