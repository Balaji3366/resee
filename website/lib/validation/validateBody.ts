import type { ZodType } from "zod";
import { badRequest } from "@/lib/errors";

export type ValidateBodyResult<T> =
  { success: true; data: T } | { success: false; error: ReturnType<typeof badRequest> };

/**
 * Parses and validates a request body against a Zod schema. Returns a
 * typed result instead of throwing, so callers decide how to respond
 * (matching this codebase's existing "never surface a raw error" rule).
 * Reference usage: app/api/onboarding/route.ts. Existing business-module
 * routes (Learning/Practice/Resume/Interview/Jobs) are not retrofitted in
 * Sprint 1 — see docs/standards/api-standards.md's Validation section.
 */
export async function validateBody<T>(
  schema: ZodType<T>,
  request: Request
): Promise<ValidateBodyResult<T>> {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return { success: false, error: badRequest("Request body must be valid JSON.") };
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const detail = firstIssue
      ? `${firstIssue.path.join(".") || "body"}: ${firstIssue.message}`
      : "Invalid request body.";
    return { success: false, error: badRequest(detail) };
  }

  return { success: true, data: result.data };
}
