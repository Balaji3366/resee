---
status: Draft
last-reviewed: 2026-08-02
source: audit performed against live codebase + live Supabase project; supersedes nothing — website/lib/ai/README.md and docs/architecture/ai-architecture.md remain the in-code reference for what exists, this is the forward-looking plan for what gets built on top of it
---

# ReSee AI Ecosystem — Readiness Audit & Implementation Roadmap

This is a planning document only. Nothing in this file has been implemented, committed, or pushed. It exists to (a) record precisely what AI infrastructure already exists so nothing gets rebuilt, (b) name the gaps and the product decisions that block implementation, and (c) sequence the actual feature work into phases with real dependencies.

---

## Part 1 — Audit: What Exists Today

### 1.1 AI Infrastructure (`lib/ai/**`) — complete, real, unused

Every file below is fully implemented, working code — not a stub. Nothing in the running app calls any of it yet.

| File | Role | Status |
|---|---|---|
| `providers/types.ts` | `AIProvider` interface every adapter implements | Complete |
| `providers/gemini.ts` | The one real adapter — retries on 429/5xx with exponential backoff, normalizes token usage | Complete |
| `providers/index.ts` | Factory (`getProvider()`), defaults to Gemini | Complete |
| `promptBuilder.ts` | Shared identity rules, date-injection, `formatContextBlock()`, `buildMessages()` | Complete |
| `prompts/*.ts` | One typed builder per capability | **7 of 9 built** — see 1.2 |
| `responseParser.ts` | `safeJsonParse<T>()` — strips fences, never throws | Complete |
| `errorHandler.ts` | `normalizeAIError()` — consistent 429/5xx/4xx classification | Complete |
| `logger.ts` | `logAIRequest()` — writes to `ai_requests` | Complete |
| `rateLimiter.ts` | `checkRateLimit()` — Postgres sliding window against `ai_requests` | Complete |
| `cache.ts` | `getCachedResponse()`/`setCachedResponse()` against `ai_response_cache` | Complete |
| `credits.ts` | `getSubscription()`/`hasCredits()`/`deductCredits()`/`grantCredits()` | Complete |
| `security.ts` | `validatePromptInput()` (length + injection-phrase guard), `redactSensitiveFields()` | Complete, **but `redactSensitiveFields()` is never called anywhere, including inside the logger** |
| `userContext.ts` | `buildUserContext()` — aggregates profile/resume/skills/learning/practice/interviews/jobs into one typed object | Complete, reuses existing aggregation functions rather than duplicating queries |
| `memory.ts` | `getOrRefreshMemory()` — 24h-stale cache of `buildUserContext()`'s output | Complete |
| `requestManager.ts` | `runAIRequest()` — the single orchestrating entry point: validate → rate-limit → credits → cache → provider call → parse → log → deduct → cache-write | Complete |

**Verdict: this layer is production-grade and ready to be called.** It is the single best piece of unused infrastructure in the codebase.

### 1.2 Prompt Builders — 7 of 9 exist

| Feature (`AIFeature`) | Prompt builder | Status |
|---|---|---|
| `resume_analysis` | `buildResumeAnalysisPrompt` | ✅ Built |
| `resume_rewrite` | `buildResumeRewritePrompt` | ✅ Built |
| `job_match` | `buildJobMatchPrompt` | ✅ Built |
| `interview_evaluation` | `buildInterviewFeedbackPrompt` | ✅ Built |
| `skill_gap` | `buildSkillGapPrompt` | ✅ Built |
| `career_roadmap` | `buildRoadmapPrompt` | ✅ Built |
| `career_coaching` | `buildCareerCoachingPrompt` | ✅ Built |
| `learning_recommendation` | — | ❌ **Missing** — flag and type exist, no prompt builder |
| `daily_recommendation` | — | ❌ **Missing** — flag and type exist, no prompt builder |

Every existing builder follows the same shape: takes `(context: UserContext, params)`, returns `{ system, user }`, asks for strict JSON with an exact schema in the system prompt, and pulls only the `UserContext` fields relevant to that feature via `formatContextBlock()` (not the whole object — deliberate data-minimization).

### 1.3 Database

**Tracked in migrations (`0012_ai_architecture.sql`), all confirmed live:**

| Table | Purpose | RLS |
|---|---|---|
| `subscription_plans` | Catalog: free (20 credits/mo) / pro (300/mo) / enterprise (unlimited) | Public read |
| `user_subscriptions` | Per-user plan + credit balance | Select-own only; all writes via `supabaseAdmin` |
| `ai_credit_transactions` | Append-only ledger backing the balance | Select-own |
| `ai_requests` | Every AI call's outcome, tokens, latency — doubles as the rate-limit counter | Select-own |
| `ai_feedback` | Thumbs up/down per request | Full own-row CRUD |
| `ai_user_memory` | Cached `UserContext` snapshot (not chat history) | Select-own |
| `ai_response_cache` | Cached AI *responses*, keyed by feature+context+params hash | Zero select policy (service-role only) |

**Not tracked in any migration — schema drift risk:** `chat_sessions`, `chat_messages`, `chat_history` (all referenced by `app/api/chat/**`, all created directly in the Supabase dashboard outside the migration convention this project otherwise follows strictly). This is the same class of gap the recent migration audit found and fixed for Jobs/career-score/platform-foundation — it should get the same treatment.

**`profiles.ai_summary`**: written once by `/api/onboarding` (careerHealthScore, strengths, gaps, focusAreas, recommendedFirstSteps) — the only legacy route whose output is actually persisted into the main profile record.

### 1.4 Caching, Rate Limiting, Logging, Cost Controls, Feature Flags

| Capability | Built? | Wired into any live route? |
|---|---|---|
| Response caching (`ai_response_cache`) | ✅ | ❌ |
| AI-specific rate limiting (10 req/60s/feature, Postgres-backed) | ✅ | ❌ |
| General rate limiting (`lib/rateLimiting.ts`, 60 req/60s) | ✅ | ❌ (not even used by non-AI routes) |
| Request/error logging (`ai_requests`) | ✅ | ❌ |
| Credit deduction/enforcement | ✅ | ❌ |
| Prompt-injection / length validation | ✅ | ❌ |
| PII redaction before logging | ✅ | ❌ (function exists, zero call sites — not even from inside `logAIRequest` itself) |
| Feature flags (9, all AI, all default `false`) | ✅ static config + React Context (`FeatureFlagsProvider`) | Read by zero components; no runtime/remote toggle exists — flipping one requires a code change + deploy |

### 1.5 API Routes — two fully separate worlds

**The legacy world (10 routes, all live, all unmonitored):**

| Route | Model | Rate-limited | Logged | Credits | Cached | Persists to |
|---|---|---|---|---|---|---|
| `/api/interview` | `gemini-3-flash-preview` | No | No | No | No | — |
| `/api/resume` | `gemini-3-flash-preview` | No | No | No | No | `resume_history` (untracked table) |
| `/api/resume/improve` | `gemini-3-flash-preview` | No | No | No | No | — |
| `/api/quiz` | `gemini-3-flash-preview` | No | No | No | No | — |
| `/api/quiz/file` | **`gemini-2.5-flash`** (inconsistent model string) | No | No | No | No | — |
| `/api/summarize` | `gemini-3-flash-preview` | No | No | No | No | — |
| `/api/pdf-chat` | `gemini-3-flash-preview` | No | No | No | No | — |
| `/api/onboarding` | `gemini-3-flash-preview` | No | No | No | No | `profiles.ai_summary` |
| `/api/chat` | `models/gemini-3-flash-preview` | No | No | No | No | `chat_history` — **appears orphaned, no caller found** |
| `/api/chat/stream` | `models/gemini-3-flash-preview` | No | No | No | No | `chat_sessions`, `chat_messages` (untracked) — the real, live chat backend behind `AIChat.tsx` |

Every one of these constructs its own `GoogleGenAI` client directly with `process.env.GEMINI_API_KEY!`, duplicating retry/parsing/error-handling logic slightly differently each time. None check auth consistently, none redact PII, none cost anything against a user's plan.

**The orchestrator world:** zero routes. `runAIRequest()` has never been called from an actual `app/api/**` handler.

### 1.6 Per-module integration points

| Module | Current AI touchpoint | Gap |
|---|---|---|
| **Resume Studio** | None. The wizard-based builder (`/resumes`) has zero AI. The legacy `/resume` analyzer is a completely separate, disconnected feature (upload a PDF, not tied to a saved resume) | No "Analyze my resume" or "Improve my resume" button exists anywhere inside Resume Studio itself |
| **Mock Interview** | None. `InterviewSessionRunner` collects free-text answers and stores them verbatim; `interview_attempts` has no score/feedback column by design (the migration comment explicitly reserves that for a future, separately-RLS'd table) | No per-question or per-session feedback exists anywhere in the UI |
| **Jobs & Career Hub** | None. Job cards/detail pages show raw skills lists; `jobMatch.ts` prompt exists but nothing calls it | No match score, no "why this job fits you" surfaced anywhere |
| **Learning** | None — and no *rule-based* recommendation engine exists either (the original Progress module spec asked for rule-based recommendations like "Complete API Testing next"; that was never built, AI or otherwise) | This is the only module with literally nothing to wire onto — it needs new UI, not just a new backend call |

---

## Part 2 — What's Missing

### 2.1 Missing infrastructure

1. **2 of 9 prompt builders** (`learning_recommendation`, `daily_recommendation`) don't exist.
2. **No route/hook layer** anywhere calls `runAIRequest()` — the entire orchestrator is inert.
3. **No shared UI primitives** for AI features: no loading/streaming state, no "AI-generated" disclosure badge, no credit-exhausted empty state, no error-state mapped to `AIErrorCode`. Every other module in this app has these shared states (`EmptyState`, `ErrorState`, `LoadingState`) — AI features have no equivalent yet.
4. **No admin visibility** into AI usage/cost/errors. Every other module (Learning, Practice, Mock Interview, Jobs) now has a full admin CMS; there is no admin page reading `ai_requests`/`ai_credit_transactions`/`user_subscriptions` at all.
5. **`chat_sessions`/`chat_messages`/`chat_history` have no tracked migration** — same class of gap the last migration audit found and fixed elsewhere.
6. **`redactSensitiveFields()` is dead code** — PII currently would flow into `ai_requests`/`ai_response_cache` unredacted the moment any route starts using the orchestrator, unless this gets wired into `requestManager.ts` first.
7. **No mechanism to grant/comp credits** from an admin surface — `grantCredits()` exists, nothing calls it.
8. **No payment integration** — `subscription_plans.price_usd_cents` is descriptive only; upgrading tiers has no real mechanism.
9. **`lib/careerScore.ts`'s CTAs point at retired routes** (`/quiz`, `/documents` instead of the current Practice/Resume Studio surfaces) — a small, unrelated staleness bug worth fixing whenever this file is next touched, not because it blocks AI work.

### 2.2 Product decisions required before implementation

1. **Legacy route fate** — retire, redirect onto the orchestrator, or let them keep running unmonitored indefinitely? This is the single biggest architectural fork in this roadmap.
2. **AI-generated content disclosure** — what exact labeling/UX is required (legal/trust, and the PRD's own risk register flags "hallucinated content presented as fact" as unmitigated today)?
3. **Free-tier generosity** — is 20 credits/month enough for a user to meaningfully try resume analysis + interview feedback + job match in a single session, or does the free tier need to be feature-specific rather than a shared pool?
4. **Should resume analysis be free** (loss-leader, drives adoption) or credit-gated from day one, given the legacy `/resume` analyzer has already trained users to expect it for free?
5. **Interview feedback granularity** — per-question (fits the existing one-question-at-a-time runner) or a single end-of-session postmortem (cheaper, fewer AI calls, less immediate)?
6. **Data retention & redaction policy** — what actually gets sent to Gemini from a resume/interview answer, and for how long does `ai_requests`/`ai_response_cache` retain it? The PRD flags this as explicitly unresolved.
7. **Rule-based vs AI for Learning recommendations** — does AI replace the never-built rule-based version outright, or should the simple rule-based version ship first (as originally spec'd) with AI layered on later?
8. **Coaching vs. existing chat** — `career_coaching` (single-turn, context-grounded, no history) and `/api/chat/stream` (multi-turn, general-purpose, has history) will look similar to a user. Do they merge into one surface, or coexist as two distinctly-purposed features (a dashboard "coach" widget vs. a general assistant page)?
9. **Admin observability requirement** — given every other module got an admin CMS built alongside it, should one be required *before* the first AI feature ships, or can it follow shortly after?
10. **Single-provider risk tolerance** — ship on Gemini alone (simpler, faster) or require an OpenAI fallback adapter first for resilience (the interface is ready; the second adapter is not)?

---

## Part 3 — Implementation Roadmap

Phases are ordered by dependency, not just feature priority — each phase's "Required infrastructure" column is a strict prerequisite for what follows.

### Phase 0 — Foundation Hardening (no user-facing feature; blocks everything else)

Must happen before *any* AI feature ships, because it closes gaps that would otherwise be baked into the first feature and repeated in every one after:

- Decide and record product decisions #1, #2, #6 above (legacy fate, disclosure, redaction policy) — these are one-time calls, not per-feature ones.
- Wire `redactSensitiveFields()` into `requestManager.ts` (call it right before `logAIRequest`/`setCachedResponse`) so the very first live AI call is already compliant with whatever redaction policy gets decided.
- Add a tracked migration for `chat_sessions`/`chat_messages`/`chat_history` (schema-drift fix, mirrors the recent Jobs/`career_score_history`/`api_requests` fix).
- Build the shared AI UI primitives once: a disclosure badge/wrapper, a credit-exhausted empty state, an error-state mapping for `AIErrorCode`, and a loading/streaming shell — every subsequent phase reuses these instead of one-off UI.
- Build a minimal admin AI-observability page (reuse the existing admin CMS pattern) reading `ai_requests` (volume/errors/latency) and `user_subscriptions`/`ai_credit_transactions` (usage by plan) — even a read-only table view closes gap #4 enough to ship Phase 1 responsibly.
- If product decision #1 is "retire legacy," this phase also adds rate limiting + auth checks to whichever legacy routes survive as a stop-gap before their real migration.

### Phase 1 — Resume Analysis

The obvious first feature: highest existing user demand (the legacy analyzer proves it), the prompt builder already exists, and it directly replaces a disconnected, unmonitored legacy route with a properly-metered one wired to the *actual* Resume Studio content instead of a disposable PDF upload.

| | |
|---|---|
| **Purpose** | Score a user's saved resume for ATS compatibility and quality, tied to their real Resume Studio record instead of a throwaway upload |
| **Inputs** | `resumeText` (derived from the resume's `content` JSON, not a re-uploaded PDF), `UserContext.targetCareer`/`skillLevel` |
| **Outputs** | `{ atsScore, summary, strengths[4], weaknesses[4], missingKeywords[4], suggestions[4] }` |
| **Required infrastructure** | Phase 0 complete; a new route (e.g. `app/api/resumes/[id]/analyze/route.ts`) calling `runAIRequest` with `feature: "resume_analysis"`; a hook + UI panel inside `/resumes/[id]` |
| **UX** | A button on the resume preview page ("Analyze Resume") → loading state → score card + strengths/weaknesses/suggestions, with the disclosure badge from Phase 0 |
| **Cost considerations** | `creditCost: 1`, `cacheTtlSeconds` set high (e.g. 3600) since re-analyzing unchanged content should hit cache, not re-call Gemini |
| **Risks** | Users comparing this to the free legacy analyzer may resist a credit cost — informs product decision #4 |
| **Recommended order** | First — no dependency on any other new feature |

### Phase 2 — Resume Rewrite

Ships immediately after Analysis since it shares the same UI shell and resume data source, and product decision #4 will already be resolved by then.

| | |
|---|---|
| **Purpose** | Produce a rewritten, ATS-friendlier version of the same resume content |
| **Inputs** | Same `resumeText` as Phase 1, optional `targetRole` override |
| **Outputs** | Structured rewritten resume (name/summary/skills/experience/education) |
| **Required infrastructure** | Phase 1's route/UI shell, extended with an "Improve my resume" action; a review-and-apply step before overwriting the live resume (never silently overwrite — this is a real, versioned document via `resume_versions`) |
| **UX** | Rewrite result shown side-by-side or as a diff, with an explicit "Apply to my resume" action that goes through the existing `maybeSnapshotVersion` throttled-save path, not a silent overwrite |
| **Cost considerations** | Higher `creditCost` than analysis (more output tokens); no caching (a rewrite should reflect the current resume, not a stale one) |
| **Risks** | Rewritten content must never fabricate experience not present in the source — the prompt already instructs this; needs a visible reminder to the user to verify facts before applying |
| **Recommended order** | Second, directly after Phase 1 |

### Phase 3 — Interview Feedback

Second-highest leverage: Mock Interview already collects real free-text answers with zero scoring today — this is the single biggest "obviously missing" feature gap in the whole audit.

| | |
|---|---|
| **Purpose** | Score a candidate's answer to one interview question and give actionable feedback |
| **Inputs** | `question`, `answer` (from `interview_attempts.answers`), `roleTitle` (from the interview set) |
| **Outputs** | `{ score, strengths[1-3], improvements[1-3], modelAnswerNotes }` |
| **Required infrastructure** | Phase 0's redaction/disclosure; a **new, separately-RLS'd table** for feedback (the `0010` migration explicitly reserves this — never add a score column to the public-read `interview_questions`/store it on `interview_attempts` without checking RLS implications first); a route + UI addition to `InterviewCompletionScreen` |
| **UX** | Resolves product decision #5 first — likely per-question feedback shown inline during review (fits the existing "review every question" completion screen) rather than a separate flow |
| **Cost considerations** | This is the most credit-expensive feature per session if done per-question (one AI call per question vs. one per session) — worth prototyping both costs before committing |
| **Risks** | Free-text answers can be long/rambling; `validatePromptInput`'s 20,000-char guard is the only current defense against a runaway prompt |
| **Recommended order** | Third — depends on Phase 0 only, not on Phases 1-2, but sequenced after them because Resume features are lower-risk to ship first (no new table needed) |

### Phase 4 — Job Match

| | |
|---|---|
| **Purpose** | Show how well a user's profile matches a specific job posting |
| **Inputs** | `jobTitle`, `jobDescription`, `jobSkills` (from the `jobs` row), `UserContext.skills`/`resume.skills` |
| **Outputs** | `{ matchScore, matchingSkills[], missingSkills[], summary }` |
| **Required infrastructure** | A route (e.g. `app/api/jobs/[jobSlug]/match/route.ts`); a match-score badge on `JobCard`/the job detail page |
| **UX** | Score badge on the job card in search results (cheap to compute once, cache aggressively per user+job since a job posting's content is static) |
| **Cost considerations** | High cache value — `cacheTtlSeconds` can be very long (job descriptions rarely change); consider computing on-demand per view rather than eagerly for every listed job (cost scales with catalog size otherwise) |
| **Risks** | Showing a low match score inline in search results could discourage applications the user might otherwise have made — consider showing it only on the detail page, not the list, until this is validated |
| **Recommended order** | Fourth — independent of Resume/Interview phases, but benefits from Phase 0's shared UI patterns being proven first |

### Phase 5 — Skill Gap + Career Roadmap

Natural pair: both consume the same `UserContext.skills`/`practice` shape and both feed the Progress module, so shipping together avoids building the same "target role" input UI twice.

| | |
|---|---|
| **Purpose** | Skill Gap: identify what a target role needs vs. what the user has. Roadmap: turn that gap into an ordered, milestone-based plan |
| **Inputs** | `targetRole` (new user input — doesn't exist as a field today outside `profiles.target_career`), `UserContext.skills`/`practice` |
| **Outputs** | Skill Gap: `{ hasSkills[], missingSkills[], recommendations[3-5] }`. Roadmap: `{ milestones: [{title, description, estimatedWeeks}] }` |
| **Required infrastructure** | A "target role" picker if the user hasn't set one via onboarding; a new Progress-module UI section for both results |
| **UX** | Natural home is the Progress dashboard, next to the existing `SkillProgressList`/`StrengthsAndWeaknesses` components — this is additive to a page that already exists, not a new page |
| **Cost considerations** | Roadmap output is the largest structured response of any feature so far (multiple milestones) — worth a higher credit cost |
| **Risks** | A roadmap that doesn't connect back to real Learning-module content (e.g., a milestone naming a course that doesn't exist) would erode trust fast — cross-check milestone titles against real `courses`/`practice_topics` where possible, or explicitly scope this out as free-text guidance only for v1 |
| **Recommended order** | Fifth |

### Phase 6 — Career Coaching

Deliberately last among the "core 7" because product decision #8 (coaching vs. existing chat) needs to be resolved with real usage data from Phases 1-5 informing what users actually ask for.

| | |
|---|---|
| **Purpose** | Single-turn, context-grounded career advice — explicitly not a conversation |
| **Inputs** | `userMessage`, full `UserContext` (career goal, target career, skill level, learning/interview stats) |
| **Outputs** | `{ reply (<120 words), suggestedActions[1-3] }` |
| **Required infrastructure** | Resolves product decision #8 first; likely a dashboard widget, not a full page |
| **UX** | A "Ask your career coach" box on the main dashboard, distinct in framing from the general `/api/chat/stream` assistant (which should probably be told about the user's real context too, eventually, but that's a separate unification project, not this one) |
| **Cost considerations** | Cheapest output of any feature (under 120 words) — good candidate for a generous free-tier allocation |
| **Risks** | If it looks and feels identical to the existing chat assistant, users won't understand why there are two — the UX framing has to make the distinction obvious |
| **Recommended order** | Sixth |

### Phase 7 — Learning & Daily Recommendations

Last among the named features because it's the only one requiring **new prompt builders** (none exist) **and** new UI (no existing surface to attach to, unlike every other phase).

| | |
|---|---|
| **Purpose** | Suggest what to do next in Learning ("Complete API Testing next") and a daily nudge |
| **Inputs** | `UserContext.learning`/`practice` (completion %, streaks, weak topics) |
| **Outputs** | Not yet designed — no prompt builder exists; needs a schema decided as part of this phase |
| **Required infrastructure** | Two new prompt builders; resolves product decision #7 (rule-based first vs. AI-only) — if rule-based-first is chosen, that ships as a non-AI feature ahead of this phase entirely, computed straight from `UserContext`-equivalent data with no AI call at all |
| **UX** | Learning dashboard + Daily Challenge entry point (both already exist as pages with no recommendation widget on them today) |
| **Cost considerations** | "Daily" cadence implies either a scheduled batch job (cheaper, one call/user/day) or on-demand-with-long-cache (simpler, no new infra) — the batch approach needs a job runner this project doesn't have yet, so on-demand-with-cache is the pragmatic v1 |
| **Risks** | Lowest existing user expectation of any feature (nothing like it exists today, rule-based or AI) — easiest to under-deliver on without anyone noticing, but also easiest to over-scope |
| **Recommended order** | Seventh — last, and only after product decision #7 is made |

### Phase 8 — Ongoing, parallel to all of the above

Not a sequential phase — these run alongside Phases 1-7 as they mature:

- Expand the Phase 0 admin observability page into real cost/usage dashboards (matches `docs/roadmap/roadmap.md`'s own Phase 3 "structured observability" goal).
- Retire or fully migrate whatever legacy routes product decision #1 didn't already resolve.
- Evaluate a second provider adapter (OpenAI) once real usage data shows Gemini reliability/cost characteristics in production.
- Revisit `lib/careerScore.ts`'s stale CTAs and wire its 5 permanently-stubbed sub-metrics (`technicalSkills`, `interviewReadiness`, `learningProgress`, `projectPortfolio`, `jobReadiness`) to the now-real Phase 1-5 outputs — this is the payoff moment for the whole `UserContext` investment: Career Score stops being mostly "not_started" placeholders.

---

## Summary

The infrastructure is unusually complete for a set of features with zero live usage — this is a rare case where the hard architectural work (provider abstraction, credits, caching, rate limiting, logging, context aggregation, prompt design for 7 of 9 features) is already done to a production standard. What's missing is entirely at the edges: the last two prompt builders, the UI shell every feature will share, admin visibility, one schema-drift fix, and — most importantly — a small set of product decisions that no amount of further code-reading will resolve. Phase 0 exists specifically to force those decisions before the first feature ships, so Phase 1 onward is pure execution against a settled foundation rather than re-litigating policy with every new route.
