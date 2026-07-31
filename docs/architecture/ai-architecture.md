---
status: Accepted
last-reviewed: 2026-07-31
source: website/lib/ai/README.md (kept in sync — that file remains the in-code reference; this is the doc-site copy)
---

# ReSee AI Architecture

This is pure infrastructure. **Nothing in the running app calls any of this
yet** — no page, no `app/api/**` route, no sidebar/dashboard change. It
exists so the next phase (whichever AI capability gets built first — ATS
analysis, job match, interview evaluation, roadmaps, skill gap, career
coaching, recommendations) has a single, consistent service layer to call
instead of hand-rolling another one-off Gemini integration the way the 8
existing AI routes each did.

## Why this exists

Eight routes already call Gemini today (`/api/interview`, `/api/resume`,
`/api/resume/improve`, `/api/chat`, `/api/chat/stream`, `/api/quiz`,
`/api/quiz/file`, `/api/summarize`, `/api/pdf-chat`, `/api/onboarding`).
Every one of them duplicates the same handful of concerns slightly
differently: does it retry on failure, does it handle 429 specially, does
it strip markdown fences before parsing JSON, does it use the shared
`supabaseAdmin` client or roll its own. None of them are touched by this
work — they keep running exactly as they are. This architecture is what a
*future* feature reaches for instead of copying the ninth
slightly-different version of the same pattern.

## Layers

```
lib/ai/
  providers/          -- swappable AI provider adapters
    types.ts           AIProvider interface every adapter implements
    gemini.ts           the one real, working adapter (only SDK proven in this app)
    index.ts            factory — getProvider() defaults to Gemini
  promptBuilder.ts     -- shared prompt assembly (identity rules, date context, context formatting)
  prompts/             -- one typed builder per capability (resumeAnalysis, resumeRewrite,
                          jobMatch, interviewFeedback, skillGap, roadmap, careerCoaching)
  responseParser.ts    -- safeJsonParse<T>() — strips markdown fences, never throws
  errorHandler.ts      -- normalizeAIError() — consistent 429/5xx/4xx classification
  logger.ts            -- logAIRequest() — writes to ai_requests (the AI Logging component)
  rateLimiter.ts       -- checkRateLimit() — Postgres sliding-window count, not Redis
  cache.ts             -- getCachedResponse()/setCachedResponse() — caches AI *outputs*
  credits.ts           -- getSubscription()/hasCredits()/deductCredits()/grantCredits()
  security.ts          -- validatePromptInput()/redactSensitiveFields()
  userContext.ts       -- buildUserContext() — the User Context Engine
  memory.ts            -- getOrRefreshMemory() — caches Context Engine *output*
  requestManager.ts    -- runAIRequest() — the single orchestrating entry point
```

## The request lifecycle (`requestManager.ts`)

A future feature route will look like:

```ts
const memory = await getOrRefreshMemory(userId);
const context = memory.contextSnapshot ?? (await buildUserContext(userId));
const prompt = buildResumeAnalysisPrompt(context, { resumeText });

const result = await runAIRequest<ResumeAnalysisResult>({
  userId,
  feature: "resume_analysis",
  context,
  prompt,
  params: { resumeText },
  creditCost: 1,
  cacheTtlSeconds: 3600,
});
```

`runAIRequest` handles, in order: input validation → rate limit check →
credit check → cache lookup → provider call (with retry on 429/5xx) →
response parsing → request logging → credit deduction → cache write.
Every step is real, working code — none of it is a stub waiting to be
filled in.

## Memory vs. Cache — two different things with similar names

- **`ai_user_memory`** (`memory.ts`) caches the User Context Engine's
  *output* — career goal, preferred role, skill level, learning progress.
  Refreshed when stale (>24h) or on explicit `force`. This is what "AI
  Memory" means in the product spec: **career context, not chat
  history.** No conversation is ever stored here.
- **`ai_response_cache`** (`cache.ts`) caches an actual AI *response* for
  a given feature+context+params combination, short TTL, to avoid a
  redundant provider call for an identical request. Zero RLS select
  policy — service-role only, same pattern as
  `quiz_questions`/`practice_questions`.

## Credits — server-enforced, never client-writable

`user_subscriptions` has a select-own RLS policy and nothing else. Every
credit change goes through `lib/ai/credits.ts` using `supabaseAdmin`,
writing both the denormalized balance and an `ai_credit_transactions`
ledger row together. A user can view their balance and history but can
never edit either directly.

## Extension points for what's explicitly NOT built yet

- **A second AI provider** (OpenAI, Anthropic, ...): implement the
  `AIProvider` interface in `providers/types.ts`, register it in
  `providers/index.ts`. Nothing else changes. `openai` is already an
  installed dependency with zero usages anywhere in this codebase today —
  there was nothing real to normalize into a second adapter yet, so only
  the seam exists, not a second fake-working one.
- **OCR / Speech-to-Text / Text-to-Speech**: would be a parallel
  `MediaProvider` interface alongside `AIProvider` — no code exists for
  this yet, by design.
- **Voice / Video interviews**: `interview_questions.question_type` in
  the Mock Interview module already carries a
  `-- future: 'voice', 'video'` comment documenting this exact seam. Not
  duplicated here.
- **RAG / vector database**: would need a `VectorStoreAdapter` interface
  and a pgvector-backed table. Neither the extension nor pgvector itself
  exists yet — there's nothing real to build until an actual retrieval
  feature is scoped.

## What this does NOT do

- Call any of the 8 existing AI routes, or change their behavior in any
  way.
- Expose any new page or API route to the running app.
- Integrate real payments — `subscription_plans` rows are descriptive
  only.
- Implement a second AI provider, OCR/STT/TTS, or RAG — see extension
  points above.
- Modify `lib/careerScore.ts` — its 5 permanently-stubbed sub-metrics
  (`technicalSkills`, `interviewReadiness`, `learningProgress`,
  `projectPortfolio`, `jobReadiness`) are exactly the vocabulary
  `UserContext` is designed to feed in a future phase, but that wiring is
  future work, not part of this one.
