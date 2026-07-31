/**
 * Rate-limit windows, single source of truth. lib/ai/rateLimiter.ts (the
 * existing AI-only limiter) and lib/rateLimiting.ts (the new
 * general-purpose limiter, Sprint 1 — Foundation Setup) both read from
 * here instead of hardcoding their own literals.
 */
export const limitsConfig = {
  ai: {
    windowSeconds: 60,
    maxRequestsPerWindow: 10,
  },
  general: {
    windowSeconds: 60,
    maxRequestsPerWindow: 60,
  },
} as const;
