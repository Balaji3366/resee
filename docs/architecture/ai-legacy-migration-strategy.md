---
status: Draft
last-reviewed: 2026-08-02
source: written as part of AI Phase 0 (foundation hardening); supersedes nothing — docs/architecture/ai-implementation-roadmap.md remains the feature roadmap, this document only covers how the 10 legacy AI routes move onto the shared orchestrator without breaking anything
---

# Legacy AI Route Migration Strategy

Phase 0 explicitly forbids replacing or removing legacy routes. This document records what was safely done to them in Phase 0, what remains, why the remainder cannot be done safely yet, and the order to do it in once it can.

---

## 1. What Phase 0 changed (done, live, behavior-preserving)

8 of the 10 legacy routes (`/api/resume`, `/api/resume/improve`, `/api/onboarding`, `/api/interview`, `/api/quiz`, `/api/quiz/file`, `/api/summarize`, `/api/pdf-chat`) were rewired to call `getProvider()` (`lib/ai/providers/gemini.ts`), `safeJsonParse()`, and `normalizeAIError()` instead of constructing their own `GoogleGenAI` client and hand-rolling JSON-fence-stripping and 429-detection.

This was safe because it changes only the *mechanics* of the Gemini call, not the request/response contract:

- Every route's exact URL, request body shape, and response JSON keys are unchanged (`{success, resumeText, data}`, `{success, interview}`, `{success, quiz}`, `{success, summary}`, `{success, answer}`, etc. — including the routes that use `error` as the failure key and the ones that use `message`, which were **not** unified, since that would be a response-shape change).
- `quiz/file`'s model string (`gemini-2.5-flash`, one generation behind every other route's `gemini-3-flash-preview`) is preserved exactly via the new `AIProviderRequest.model` override — it is not silently upgraded.
- Debug `console.log`/`console.dir` statements in `resume/route.ts` and `summarize/route.ts` were removed as pure cleanup while those files were open; no behavioral effect.
- `interview/route.ts`'s bespoke 3-attempt/3-second-delay retry loop was dropped in favor of `GeminiProvider`'s built-in exponential-backoff retry (which only retries on 429/5xx, not on every error the old loop did) — a strict improvement, not a behavior change a caller could observe under normal operation.
- Error message text for the 429 case is now emitted by `normalizeAIError()` and is consistent across all 8 routes; a couple of routes' exact wording shifted slightly (e.g. "in a minute" vs. "in a few minutes" collapsed to one canonical string). No route's error *shape* changed, only some literal strings in the rare paths where the caller was showing raw error text to a user.

**Not touched in Phase 0:** `/api/chat` and `/api/chat/stream`. Both are structurally different (streaming SSE, multi-turn conversation history, live-search augmentation) from the single-shot request/response shape every other legacy route and the orchestrator both assume. Migrating them means designing how `runAIRequest()` — which is not currently streaming-aware — accommodates a streaming caller, which is new design work, not a mechanical swap. This is its own future item, not part of this migration's sequencing below.

---

## 2. Why full orchestrator adoption (rate limiting, credits, caching, logging) is blocked

`runAIRequest()` requires a `userId` to check rate limits, enforce/deduct credits, and log the request against a real user. **None of the 10 legacy routes authenticate the caller.** Concretely:

- `/api/interview`, `/api/quiz`, `/api/quiz/file`, `/api/summarize`, `/api/pdf-chat`, `/api/resume`, `/api/resume/improve` take no session/user identity at all — `fileName` (or a raw upload) is the only input, trusted implicitly.
- `/api/onboarding` takes `userId` **from the client-supplied request body**, not from the session — any caller can pass any `userId` and write to that user's `profiles` row.

Wiring `runAIRequest()` onto any of these routes today would mean one of:

1. **Fabricate a `userId`** (e.g. a shared system user) — defeats the entire purpose of per-user rate limiting and credit enforcement, and would let one abusive caller exhaust a shared quota for everyone.
2. **Trust the client-supplied `userId`** (as `/api/onboarding` already unsafely does) — extends an existing spoofing vulnerability into the credit/rate-limit system itself, turning a data-integrity bug into a billing bug.
3. **Add real session-based auth to these routes first** — the only sound option, but it is a genuine behavior change (a route that silently worked unauthenticated now returns 401 for unauthenticated callers) that Phase 0's brief explicitly says not to make ("do NOT replace or remove legacy routes yet... do not implement AI features yet" — adding auth is app-behavior work, not infrastructure).

**This is the dependency that cannot be safely implemented in Phase 0.** It is named here as a required product/engineering decision, not silently worked around.

---

## 3. Separate, critical finding: chat tables have no user-scoping

While resolving the migration-tracking gap for `chat_sessions`/`chat_messages`/`chat_history` (previously created ad hoc in the Supabase dashboard, now tracked in `supabase/migrations/0017_chat_tables_baseline.sql`), it became apparent that **none of these tables have ever had a `user_id` column, and no route under `app/api/chat/**` filters by caller identity**:

- `GET /api/chat/sessions` returns **every user's** chat sessions, not just the caller's.
- `GET`/`DELETE /api/chat/[id]` let any caller read or delete **any session by ID**, regardless of who created it.

Migration `0017` adds a nullable `user_id` column to `chat_sessions` and `chat_history` and enables real own-row RLS policies on all three tables. This is purely additive — because the app talks to these tables exclusively through `supabaseAdmin` (which bypasses RLS), and because `user_id` is nullable and unpopulated on every existing row, **this migration changes nothing about current route behavior**. It closes the schema-drift gap and puts the enforcement mechanism in place without flipping it on.

**The actual fix — populating `user_id` on write and filtering by it on every read/delete in `app/api/chat/**` — was deliberately not implemented in Phase 0.** That is a behavior change to a live route (unauthenticated or cross-user requests that currently succeed would start failing/being scoped), which is exactly the class of change Phase 0's brief reserves for explicit approval. It is a pre-existing bug, unrelated to anything built this session, surfaced as a byproduct of the migration-tracking work.

**This needs your explicit go-ahead before it's fixed.**

---

## 4. Sequencing for full orchestrator adoption (once auth exists)

Once each route (or a shared middleware) has real session-based identity, the migration order below minimizes risk — cheapest/lowest-traffic routes first, the two most-used/most-complex routes (chat) last:

| Order | Route | Why this position |
|---|---|---|
| 1 | `/api/resume/improve` | No storage/file-download step; smallest surface; good canary |
| 2 | `/api/resume` | Same shape as #1 plus PDF text extraction (unrelated to the provider swap) |
| 3 | `/api/onboarding` | Already has a `validateBody` schema and writes to `profiles` — needs the `userId` source switched from body to session as part of adding auth, then orchestrator adoption is mechanical |
| 4 | `/api/quiz` | First PDF-attachment route; proves the `attachment` param survives `runAIRequest`'s cache-key hashing (a value up to a few MB base64) without issue |
| 5 | `/api/quiz/file` | Same shape as #4; confirms the `model` override survives orchestrator adoption (must still emit `gemini-2.5-flash`, not the default) |
| 6 | `/api/summarize` | Same shape as #4 |
| 7 | `/api/pdf-chat` | Same shape as #4, plus a second user-supplied field (`question`) that becomes part of the cache key |
| 8 | `/api/interview` | Higher-traffic, user-facing core feature (Mock Interview) — migrate after the pattern is proven on lower-stakes routes |
| 9 | `/api/chat/stream` | Requires solving streaming support in `runAIRequest()` first (new design work, not sequencing) — the real, live chat backend, migrate last and only once #1-8 have validated the non-streaming path |
| 10 | `/api/chat` | Appears orphaned (no caller found in the codebase) — confirm it is genuinely unused before spending migration effort on it; if unused, the right action is likely deletion, not migration |

Each step is independently shippable and revertible — adopting `runAIRequest()` for one route does not require touching any other, since every route already calls the shared provider/parser/error-handler directly and orchestrator adoption is an additive wrapper around that same call.

---

## 5. Summary of open items requiring a decision

1. **How should the 9 unauthenticated legacy routes gain real identity** (session-based auth on each, or a shared auth middleware) — this blocks all of Section 4 and is the single biggest unblock for AI Phase 1.
2. **Should the chat cross-user-data-exposure bug be fixed now**, as a standalone security fix (Section 3), ahead of any further AI feature work?
3. **Is `/api/chat` actually dead code?** Worth a quick confirmation before it's either migrated or removed.
