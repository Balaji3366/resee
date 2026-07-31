import { AppError } from "@/lib/errors";
import type { ApiFailure, ApiSuccess } from "@/types/errors";

/**
 * Codifies the { success, ...data } shape every route in app/api/**
 * already follows manually (see docs/standards/api-standards.md) — not a
 * new convention, just a shared helper for the existing one.
 */
export function jsonOk<T extends object>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccess<T> = { success: true, ...data };
  return Response.json(body, init);
}

/**
 * Accepts either an AppError (status/message derived from it) or a raw
 * message + explicit status, matching how most routes today just return
 * { success: false, message } with a hand-picked status code.
 */
export function jsonError(error: AppError): Response;
export function jsonError(message: string, status: number): Response;
export function jsonError(errorOrMessage: AppError | string, status?: number): Response {
  const message = errorOrMessage instanceof AppError ? errorOrMessage.message : errorOrMessage;
  const resolvedStatus =
    errorOrMessage instanceof AppError ? errorOrMessage.status : (status ?? 500);

  const body: ApiFailure = { success: false, message };
  return Response.json(body, { status: resolvedStatus });
}
