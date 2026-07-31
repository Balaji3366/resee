import { logger } from "@/lib/logging/logger";

/**
 * Captures an unexpected error with stack + request context. Logs
 * structurally today (pluggable to a real error-tracking service later,
 * per docs/architecture/system-architecture.md's Observability section
 * — that section explicitly proposes this as the next step once request
 * volume justifies it).
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(message, { ...context, stack });
}
