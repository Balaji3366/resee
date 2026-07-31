import type { AppErrorCode, AppErrorShape } from "@/types/errors";

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  bad_request: 400,
  not_found: 404,
  rate_limited: 429,
  internal_error: 500,
};

/**
 * A typed application error carrying an HTTP status alongside its code —
 * throw or return this instead of a raw Error so route handlers can map
 * it to a response without re-deriving the status each time.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }

  toShape(): AppErrorShape {
    return { code: this.code, message: this.message };
  }
}

export const unauthorized = (message = "Unauthorized") => new AppError("unauthorized", message);

export const forbidden = (message = "Forbidden") => new AppError("forbidden", message);

export const badRequest = (message = "Bad request") => new AppError("bad_request", message);

export const notFound = (message = "Not found") => new AppError("not_found", message);

export const rateLimited = (message = "Too many requests") => new AppError("rate_limited", message);

export const internalError = (message = "Something went wrong") =>
  new AppError("internal_error", message);
