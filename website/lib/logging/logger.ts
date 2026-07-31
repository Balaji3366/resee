type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Structured (JSON-line) logging, distinct from the 141 scattered
 * console.* calls across existing routes — those are not retrofitted in
 * Sprint 1 (would mean touching business-module files). New foundation
 * code uses this; existing code adopts it opportunistically. Writes to
 * stdout/stderr today; the shape is what a future error-tracking service
 * integration (see docs/architecture/system-architecture.md's
 * Observability section) would consume.
 */
function write(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry: LogEntry = { level, message, context, timestamp: new Date().toISOString() };
  const line = JSON.stringify(entry);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => write("error", message, context),
};
