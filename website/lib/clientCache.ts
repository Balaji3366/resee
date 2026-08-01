/**
 * A minimal in-memory Map-based TTL cache — request de-dup/short-lived
 * caching for lib/apiClient.ts. No @tanstack/react-query or SWR
 * introduced; those are real, heavier dependencies for a need this
 * small cache already covers, consistent with this project's
 * established "add infra only when proven necessary" principle (see
 * docs/architecture/system-architecture.md). Lives only in memory —
 * cleared on a full page reload, which is fine for its purpose
 * (avoiding redundant requests within one session, not persistence).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);

  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }

  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function clearCached(key: string): void {
  store.delete(key);
}

export function clearAllCached(): void {
  store.clear();
}
