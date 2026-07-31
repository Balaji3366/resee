---
status: Accepted
last-reviewed: 2026-07-31
---

# API Standards

Every route in `website/app/api/**` follows one convention, no
exceptions.

## The convention

```ts
import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // ...query, shape response...
}
```

- `getServerSupabase()` — RLS-respecting, cookie-scoped client. Use this
  by default.
- `supabaseAdmin` (from `lib/supabase-admin.ts`) — service-role, bypasses
  RLS. Use only when the operation genuinely requires it (credit
  deduction, admin grants, reading zero-select-policy tables like
  `quiz_questions`), and re-verify authorization in code before using it
  — RLS bypass is not a shortcut around an auth check.
- **Every mutation route re-verifies auth independently**, even if a
  page-level check already happened via `proxy.ts` — a direct API call
  bypasses the proxy layer entirely.
- Admin routes additionally call `requireAdmin()`
  (`lib/adminAuth.ts`) before any `supabaseAdmin` write.
- `export const dynamic = "force-dynamic"` on every route that reads
  user-specific data — prevents accidental static caching of a
  per-user response.

## Response shape

- Success: `{ success: true, ...data }`
- Failure: `{ success: false, message: string }`, with the appropriate
  HTTP status (401 unauthorized, 400 bad input, 404 not found, 500
  unexpected).
- Never return a raw stack trace or provider error message to the
  client.

## Validation

`zod` + `lib/validation/validateBody.ts` is the shared validation helper
(added in Sprint 1 — Foundation Setup). New routes should define a schema
and call `validateBody(schema, request)` rather than hand-checking
`request.json()` output. Existing business-module routes
(Learning/Practice/Resume/Interview/Jobs) were not retrofitted in Sprint 1
— they keep their current manual `if (!field)` checks until each is
touched for its own reasons; `app/api/onboarding/route.ts` is the
reference implementation to copy from.

## CSRF — reviewed, not implemented

No CSRF token system exists, and none was added in Sprint 1. Reviewed and
assessed low-risk given: `@supabase/ssr`'s cookies default to
`SameSite=Lax`; no cross-origin CORS is configured on any route; and
every state-changing endpoint requires a bearer-equivalent Supabase
session validated via `auth.getUser()`, not just cookie presence. This is
a documented decision, not an oversight — revisit only if a real
attack-surface change occurs (e.g. adding a public, unauthenticated,
state-changing endpoint, or enabling cross-origin CORS).

## Idempotent writes

Use `upsert(..., { onConflict, ignoreDuplicates: true })` for
save-or-no-op writes (course enrollment, job saves, job applications)
rather than a manual select-then-insert-or-update round trip.
