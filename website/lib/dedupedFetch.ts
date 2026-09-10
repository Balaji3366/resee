/**
 * Collapses near-simultaneous duplicate requests to the same endpoint
 * (same method + url + body) into a single network call and a single
 * JSON parse — a second caller within the dedupe window gets the same
 * resolved result instead of triggering another fetch.
 *
 * Written for the dashboard's fetch-on-mount hooks (useProfile,
 * useCareerScore, useContinueLearning, DashboardDailyRecommendation),
 * which QA found each firing twice on one authenticated dashboard load
 * (A-L3) — reproduced in production, so not attributable to React
 * StrictMode's dev-only double-invoke. This fixes the symptom at the
 * network layer regardless of what's causing the extra effect run,
 * which "request deduplication" is an explicitly acceptable strategy
 * for per the QA remediation brief, alongside (not instead of) using
 * correct effect dependencies.
 */

interface DedupedResult<T = unknown> {
  ok: boolean;
  status: number;
  json: T;
}

const DEDUPE_WINDOW_MS = 2000;

const inFlight = new Map<string, Promise<DedupedResult>>();

export function dedupedFetchJson<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<DedupedResult<T>> {
  const key = `${init?.method ?? "GET"} ${url} ${typeof init?.body === "string" ? init.body : ""}`;

  const existing = inFlight.get(key);
  if (existing) {
    return existing as Promise<DedupedResult<T>>;
  }

  const promise = fetch(url, init).then(async (res) => ({
    ok: res.ok,
    status: res.status,
    json: await res.json().catch(() => null),
  }));

  inFlight.set(key, promise);

  // Kept in the map briefly after settling too — a second mount landing
  // a tick after the first one already resolved still reuses the result
  // instead of re-fetching, which a purely in-flight-only cache would miss.
  promise.finally(() => {
    setTimeout(() => {
      if (inFlight.get(key) === promise) {
        inFlight.delete(key);
      }
    }, DEDUPE_WINDOW_MS);
  });

  return promise as Promise<DedupedResult<T>>;
}
