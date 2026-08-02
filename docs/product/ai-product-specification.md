---
status: Approved — Decisions 1-12 locked; ready to inform Phase 0.5/Phase 1 implementation planning
version: 2.0
last-reviewed: 2026-08-02
companion-docs: docs/architecture/ai-architecture.md, docs/architecture/ai-implementation-roadmap.md, docs/architecture/ai-legacy-migration-strategy.md, docs/product/prd.md
supersedes: v1.0 of this document (Draft) — every open decision in v1.0's Part 4 is now resolved and reflected inline throughout; v1.0's reasoning is preserved in git history, not duplicated here
---

# ReSee AI Product Specification

This is the single source of truth for every AI capability on ReSee — what
each feature does, how it behaves, what it costs, how it fails, and how it
was decided. This version reflects **12 approved product decisions**
(Part 4) reviewed and locked one at a time. It remains a **planning
document** — nothing described here has been implemented as a user-facing
feature yet; no code changes accompany this revision.

It builds on two completed sprints:

- **AI Phase 0** (foundation hardening) — provider abstraction, prompt
  builders, credits/rate-limit/cache/logging infrastructure, the User
  Context Engine, shared UI primitives, and the Admin AI Dashboard all
  exist and work.
- **AI security hardening** — every existing AI route requires a
  verified, session-authenticated user; the chat system enforces
  per-user ownership at both the application and RLS layer.

---

## How to read this document

- **Part 1** — cross-cutting platform decisions (credits, models,
  streaming, safety, privacy) that apply to every feature.
- **Part 2** — the AI domains, each with a full per-feature specification.
- **Part 3** — the phased implementation roadmap, updated for every
  approved decision's scope impact.
- **Part 4** — the approved decisions log — what was decided, and where
  the full detail now lives.

---

# Part 1 — Platform-Wide AI Product Decisions

## 1.1 Free vs. Premium AI Features — Hybrid Model (Decision 1)

**Every AI feature is available to every user, on every plan, always.
No feature is ever permanently locked behind a subscription.**

Free vs. Pro/Enterprise differ across six axes instead:

| Axis | Free | Pro | Enterprise |
|---|---|---|---|
| Monthly AI credits | 15 | 300 | Unlimited |
| AI response quality | Standard | Enhanced | Enhanced |
| Context size (how much of `UserContext` a prompt draws on) | Standard | Extended | Extended |
| Analysis depth (e.g., Resume Analysis detail, Roadmap granularity) | Standard | Deep | Deep |
| Processing priority | Standard queue | Priority | Priority |
| Model selection | Default model | Access to stronger model tier when available | Access to stronger model tier when available |

Credit cost is **flat across all plans** for a given feature (§1.2) —
plan tier never changes what something costs, only how good the result
is and how far the credit pool stretches.

**What 15 Free credits buys in a month** (illustrative, using §1.2's
costs):

| Usage pattern | Credits spent |
|---|---|
| 1 resume analysis + 1 rewrite | 3 |
| 1 automatic post-interview evaluation + 1 deep-dive question analysis | 2 |
| 2 job-match checks (cache absorbs repeat views) | 2 |
| 1 skill gap check | 1 |
| 1 career roadmap | 3 |
| 3 Career Coach sessions (each covering multiple exchanges) | 3 |
| **Total** | **14** (1 credit of headroom) |

A Free user gets a genuine full tour of every feature once a month —
adoption is funded by credit generosity; monetization is funded by
quality/depth/priority/model tier, never by hiding features.

## 1.2 The AI Credit System (Decisions 2, 3, 8, 9)

- A **credit** is an abstract product-level unit, not a pass-through of
  Gemini's own token pricing.
- **Flat cost per feature across every plan** — Free and Pro pay the
  same credit price for the same feature; only output quality/depth/
  priority/model differ by plan (§1.1).
- **A cache hit never deducts a credit.** **A failed request never
  deducts a credit.**
- **Unlimited (Enterprise) plans** skip the balance check but every
  request still logs and still writes a ledger entry — usage is never
  invisible just because it's free to the user.

### Credit deduction is transactional and idempotent (Decision 8 — hard prerequisite before Phase 1)

Credit deduction must ship as **one atomic operation**: the balance
update (`user_subscriptions.credits_remaining`) and the ledger insert
(`ai_credit_transactions`) always succeed or fail together — never one
without the other. In addition, **every credit deduction must carry an
idempotency key** (or equivalent mechanism) tied to the originating AI
request, so that retries, duplicate client requests, or network failures
can never deduct credits twice for the same logical request. This is
infrastructure hardening that must land **before** any paid AI feature is
released — treated as a Phase 0.5 blocker (Part 3), not bundled loosely
into Phase 1.

### Monthly reset is lazy, atomic, and on-access (Decision 9)

No scheduler or cron job resets credits. Instead, **every time a user's
subscription is accessed** (`getSubscription()`/`hasCredits()`/
`deductCredits()`), the code checks whether `current_period_end` has
passed. If it has, atomically — as part of that same access, before any
credit validation or deduction proceeds —:

1. Reset `credits_remaining` to the plan's monthly allotment.
2. Advance `current_period_start`/`current_period_end` to the next
   period.
3. Write a `ai_credit_transactions` row tagged as a **Monthly Credit
   Reset** (a positive-amount, non-deduction ledger entry distinct from
   feature usage or manual grants).

**Unused credits never roll over** — a reset always sets the balance to
the plan's flat monthly allotment, never adds to whatever remained.

### Proposed credit cost per feature (flat across all plans)

| Feature | Credits | Rationale |
|---|---|---|
| Resume Analysis | 1 | Short, bounded JSON output |
| Resume Rewrite | 2 | Larger structured resume output |
| Job Match | 1 | Bounded output; further absorbed by long cache TTL |
| Interview Post-Session Evaluation | 1 (automatic) | Runs once per completed interview, regardless of question count |
| Interview Deep AI Analysis | 1 per question | Opt-in drill-down on top of the automatic evaluation |
| Skill Gap | 1 | Bounded output |
| Career Roadmap | 3 | Largest AI-generated layer of any feature (§2, Domain C.3) |
| Career Coach (AI Workspace, Career Coach mode) | **1 per session**, not per message | A session covers multiple back-and-forth exchanges before the next credit is charged (§2, Domain E) |
| General AI Assistant (AI Workspace, General mode) | **0 — unmetered** | Preserves the existing Chat Assistant's current free behavior; not part of the credit-metered feature set |
| Learning Recommendation (AI-enhanced layer) | 1 | Rule-based baseline (§2, Domain D) is always free, unmetered |
| Daily Recommendation (AI-enhanced layer) | 1 | Same — rule-based baseline always free |

**Career Coach session boundary** (implementation detail, not requiring
separate approval): a session credit is charged on the first message of
a new conversation in Career Coach mode; the session remains open for a
reasonable inactivity window or until the user explicitly starts a new
conversation, whichever comes first. Exact timeout is a tuning parameter
set at implementation time.

## 1.3 Token Usage Strategy

Unchanged from v1.0 — three layers already limit cost (context
minimization via `formatContextBlock()`, a 20,000-character input
ceiling via `validatePromptInput()`, and strict output schemas), plus one
still-open gap: **no `maxOutputTokens` safety net** on the provider call
itself. Recommended for Phase 1: add a per-feature `maxOutputTokens`
ceiling to `AIProviderRequest` as a backstop, not a target.

## 1.4 Streaming vs. Non-Streaming Responses

Updated for Decision 6's AI Workspace unification:

| Feature | Mode | Why |
|---|---|---|
| Resume Analysis, Resume Rewrite, Job Match, Skill Gap, Interview Post-Session Evaluation, Interview Deep AI Analysis, Learning/Daily Recommendation (AI-enhanced layer) | **Non-streaming** | Short, bounded, structured JSON — rendered as a completed card, not read progressively |
| Career Roadmap | **Non-streaming** for the AI-generated layer; catalog mapping (§2, Domain C.3) is a separate, non-AI, non-streaming step | Structured milestone list |
| **AI Workspace — both modes** (General AI Assistant *and* Career Coach) | **Streaming (SSE)** | Decision 6 requires both modes to share the same conversation UI, session handling, and infrastructure — the existing `/api/chat/stream` streaming backend becomes that shared infrastructure. Career Coach mode streams the same way General Assistant mode already does; only the context-grounding and credit-metering behavior differs between modes, not the transport. |

This is a change from v1.0, where Career Coaching was scoped
non-streaming as a standalone feature — superseded by Decision 6.

## 1.5 Model Selection Strategy

Unchanged in substance from v1.0: `gemini-3-flash-preview` remains the
default for every feature. The "future model selection" axis from
Decision 1 formalizes what was previously just an unused seam
(`AIProviderRequest.model`) into an actual plan-tier lever — Pro/
Enterprise may route to a stronger model once one is validated, Free
stays on the default. **No specific stronger model is chosen yet** —
this axis is a capability to activate later with real quality data, not
a commitment to a specific model today.

## 1.6 Future Multi-Provider Support

Unchanged from v1.0 — the `AIProvider` interface already generalizes over
any future adapter; no second provider is proposed for this phase.

## 1.7 Safety Guardrails

Unchanged from v1.0's layered-defense table, with one addition: the
**idempotency-key mechanism** (Decision 8, §1.2) is now also a safety
guardrail in the financial-integrity sense, not just a UX nicety —
preventing duplicate-charge exploits from retried requests.

## 1.8 Prompt Injection Protection

Unchanged from v1.0 — structural role separation (system vs. user) as
the primary defense, heuristic phrase-matching as secondary. Recommended
addition (unchanged): log heuristic-marker trips distinctly in
`ai_requests` for admin visibility.

## 1.9 Hallucination Mitigation

Updated per Decision 12: **Career Roadmap now formally separates AI
generation from catalog attachment** (§2, Domain C.3) specifically to
contain this risk — the AI layer is never responsible for asserting a
ReSee course exists; a separate, deterministic mapping step is. This is
the strongest structural hallucination guard in the entire spec, and it
generalizes the "do not invent" principle already used in Resume Rewrite
into an actual architectural pattern (AI proposes, a real system
verifies) rather than only a prompt instruction. The same
non-fabrication instruction recommended for Skill Gap in v1.0 still
applies unchanged.

## 1.10 AI Disclaimers (Decision 4)

- **No blocking first-use modal — ever.** The product must feel modern,
  premium, and low-friction; a gate on someone's first AI interaction
  works against that.
- **The persistent `AIDisclosureBadge` is the sole disclosure
  mechanism**, shown on every AI-generated response, every time, with no
  special first-use treatment.
- **Standard copy** (proposed): *"AI-generated — review before making
  important career decisions."*
- **Future high-risk acknowledgments** (if ever introduced) are reserved
  exclusively for genuinely high-risk AI actions, not general AI
  interaction — this is a deliberate, narrow exception, not a precedent
  for broader friction.

## 1.11 Data Retention Policy (Decision 7)

- **Retention window: 60 days** (not 90) for `ai_requests` metadata.
- **After 60 days**: request-level metadata is deleted entirely; only
  **anonymized, aggregated analytics** required for platform insights
  survive (e.g., request counts per feature per day — never tied back to
  an individual user).
- **Raw user-generated content is never stored in AI request logs,
  full stop** — not "redacted where the key name matches a pattern,"
  but an absolute rule: resume text, chat messages, PDF content, and any
  other free-text user-generated content must never appear in
  `ai_requests.params_redacted` or anywhere else in the logging path.
  Only non-identifying metadata (length, feature, status, tokens,
  latency) is ever logged. This hardens v1.0's proposed rule
  ("log length/hash, not raw text") from a recommended discipline into a
  hard constraint every feature's implementation must satisfy.
- **New requirement**: a self-service **"Delete my AI history"** action
  in Privacy settings, giving users a real hard-delete path across
  `ai_requests`, `ai_response_cache`, `ai_user_memory`, and their chat
  data. Not previously scoped in v1.0 — added here as its own line item
  (Part 3, Phase 0.5).
- `ai_response_cache` (self-expiring via TTL) and `ai_credit_transactions`
  (permanent, billing-ledger precedent) are unchanged from v1.0.

---

# Part 2 — The AI Domains

## Domain A — Resume Intelligence

### A.1 Resume Analysis (`resume_analysis`)

Unchanged from v1.0. Purpose: score a user's real, saved Resume Studio
resume for ATS compatibility. 1 credit, cached 1h, non-streaming, no raw
resume text ever logged (§1.11).

### A.2 Resume Rewrite (`resume_rewrite`)

Unchanged from v1.0. Purpose: produce a rewritten, ATS-friendlier resume,
paired tightly with Analysis. 2 credits, no caching, explicit
non-fabrication instructions, never a silent overwrite — an explicit
"Apply" action goes through the existing versioned save path.

## Domain B — Interview Intelligence

Restructured per Decision 5 into two distinct capabilities sharing one
domain.

### B.1 Interview Post-Session Evaluation (new — replaces the original single per-question `interview_evaluation` design)

- **Purpose**: Automatically generate one comprehensive evaluation for
  every completed mock interview attempt, closing the "zero AI feedback"
  gap without requiring any user action.
- **User flow**: User completes an interview attempt → the evaluation
  generates **automatically**, no button click required → the completion/
  review screen shows the evaluation card as soon as it's ready (or a
  brief "Generating your evaluation…" state if not yet ready).
- **Inputs**: All answered questions + answers from the attempt,
  `roleTitle`, `UserContext.skillLevel`.
- **Outputs** (new schema — supersedes v1.0's `InterviewFeedbackResult`
  for the session level): `{ overallScore, communicationScore,
  technicalScore, confidenceScore, strengths[], weaknesses[],
  improvementSuggestions[], overallRecommendations }`.
- **Prompt strategy**: A new prompt builder is needed — synthesizes
  across *all* answered questions in one call rather than one question at
  a time; asks for four distinct sub-scores plus qualitative synthesis.
- **Context required**: `skillLevel`, the interview set's `roleTitle`,
  all Q&A pairs from the attempt.
- **AI provider usage**: `gemini-3-flash-preview`, non-streaming.
- **Cost model**: Larger input (every answer in the session) than any
  single-question call, one bounded structured output.
- **Credit consumption**: 1 credit, charged automatically on generation.
- **Caching strategy**: None — every attempt is unique.
- **Error handling**: Standard `AIError` mapping, but see fallback —
  this is the one feature besides Learning/Daily Recommendation where
  failure handling can't rely on "user clicks retry," since there's no
  explicit user-initiated action to retry.
- **Fallback behaviour**: If generation fails (including insufficient
  credits at the moment the interview completes), the completion screen
  shows the interview results exactly as it does today (questions
  answered, time taken) with a clear, non-alarming "AI evaluation
  unavailable" note and a manual retry action — the interview completion
  itself is never blocked or degraded by an evaluation failure.
- **Privacy considerations**: Interview answers may contain personal
  narrative — never logged raw (§1.11); only length/count metadata.
- **UX behaviour**: Renders as the headline element of the completion
  screen (it's now the primary payoff of finishing an interview, not an
  optional add-on) with the `AIDisclosureBadge`.
- **Success criteria**: % of completed interviews with a successfully
  generated evaluation; correlation between evaluation scores and
  Deep AI Analysis usage (do low-scoring areas drive drill-down requests).

### B.2 Deep AI Analysis (per-question drill-down)

- **Purpose**: Let a user request detailed, single-question feedback on
  top of the automatic session-level evaluation, for whichever answers
  they want to examine closely.
- **User flow**: On the review screen, each answered question has a
  "Deep AI Analysis" action → on click, detailed per-question feedback
  renders inline for that question only.
- **Inputs/Outputs/Prompt strategy**: Unchanged from v1.0's original
  per-question design — `{ question, answer, roleTitle }` in,
  `{ score, strengths[1-3], improvements[1-3], modelAnswerNotes }` out.
- **Context required**: `skillLevel`, question's `roleTitle`.
- **AI provider usage**: `gemini-3-flash-preview`, non-streaming.
- **Cost model**: Small, bounded per call.
- **Credit consumption**: 1 credit per question, user-triggered and
  visible — a user only pays for the specific answers they want examined.
- **Caching strategy**: None.
- **Error handling**: Standard `AIError` mapping.
- **Fallback behaviour**: The session-level evaluation (B.1) and the raw
  review screen are unaffected by a Deep AI Analysis failure on any one
  question.
- **Privacy considerations**: Same as B.1 — never log raw answer text.
- **UX behaviour**: Positioned as the "want to go deeper?" action,
  clearly secondary to the automatic evaluation, not competing with it.
- **Success criteria**: Deep-dive request rate per completed interview;
  which questions get drilled into most (a signal for where users feel
  least confident, independent of what the AI evaluation itself flagged).

## Domain C — Career Intelligence

### C.1 Job Match (`job_match`)

Mechanically unchanged from v1.0 (1 credit, long cache TTL, detail-page
scoring). **UX updated per Decision 11**:

- **Default placement: Job Details page only, for every user.** This
  remains the default experience — exploration over filtering.
- **Future (not this phase)**: an opt-in user preference lets advanced
  users enable match scores in job **listings** too — off by default for
  everyone.
- **Labeling is tiered and always encouraging — never negative.**
  Proposed bands mapped from the underlying `matchScore`:

  | Score range | Label shown |
  |---|---|
  | 80-100 | Excellent Match |
  | 60-79 | Good Match |
  | 0-59 | Potential Match |

  No label below "Potential Match" is ever shown — there is no "Poor
  Match," "Weak Match," or numeric-score-only display. The goal is
  always to guide toward applying, never to discourage it.

### C.2 Skill Gap (`skill_gap`)

Unchanged from v1.0. 1 credit, ~1h cache, recommended non-fabrication
instruction addition still applies.

### C.3 Career Roadmap (`career_roadmap`) — Two-Layer Architecture (Decision 12)

Restructured from a single AI call into two distinct layers.

**Layer 1 — AI-Generated Career Guidance**

- **Purpose**: Recommend the skills, technologies, and learning
  objectives that make up a milestone-based path toward a target role.
- **Inputs**: `targetRole`, optional `timeframeMonths`,
  `UserContext.skillLevel`/`learning.completedCourseCount`/
  `practice.strongTopics`/`weakTopics` — unchanged from v1.0.
- **Outputs**: `{ milestones: [{ title, description, estimatedWeeks,
  suggestedSkills[] }] }` — the AI's job is naming *what* to learn
  (skills/technologies/objectives), never naming a specific ReSee course
  by name. The prompt must explicitly instruct the model never to
  reference or invent a ReSee course, lesson, or resource name.
- **Prompt strategy**: Ordered, concrete milestones as in v1.0, with a
  new hard constraint: describe learning objectives generically
  ("learn REST API design fundamentals"), never as "take the [X] course."

**Layer 2 — Catalog Mapping (deterministic, non-AI)**

- **Purpose**: Attach a real ReSee course/topic to each milestone where
  one genuinely exists, without the AI ever being the system of record
  for that claim.
- **Mechanism**: A separate, deterministic server-side step matches each
  milestone's `suggestedSkills`/topic against the real `skills`/`courses`/
  `practice_topics` catalog (the same skill-linkage data the User Context
  Engine already reads). This is plain matching logic, not an AI call —
  no credit cost, no hallucination surface.
- **Outcome per milestone**: either a real `matchedCourseSlug`
  (`courseMatchStatus: "matched"`) or an explicit
  `courseMatchStatus: "not_available"` — **never silently omitted and
  never a fabricated slug.** The UI clearly indicates "No internal course
  currently available for this yet" when unmatched, so the roadmap stays
  fully useful as guidance even where the catalog has a gap.

**Remaining dimensions** (apply to the combined feature):

- **AI provider usage**: `gemini-3-flash-preview` for Layer 1 only;
  Layer 2 has no AI provider usage at all.
- **Cost model**: Layer 1 unchanged (largest AI output in the catalog);
  Layer 2 adds a real but small engineering cost (matching logic), zero
  marginal runtime AI cost.
- **Credit consumption**: 3 credits — covers Layer 1 only; Layer 2 is
  free to compute since it's not an AI call.
- **Caching strategy**: ~6h TTL on Layer 1's output; Layer 2's mapping
  can be recomputed on every render cheaply (or cached alongside Layer 1)
  since it's deterministic and inexpensive.
- **Error handling**: Standard `AIError` mapping for Layer 1; Layer 2
  failures (e.g., a catalog query error) degrade to showing Layer 1's
  guidance with every milestone marked `"not_available"` rather than
  blocking the whole roadmap.
- **Fallback behaviour**: Skill Gap (its natural predecessor) is
  unaffected by a Roadmap failure.
- **Privacy considerations**: No free-text PII in either layer.
- **UX behaviour**: Each milestone visually distinguishes "here's what to
  learn" (always present) from "here's where on ReSee" (present only
  when matched) — the roadmap never reads as broken or incomplete when a
  course doesn't exist, just honestly labeled.
- **Success criteria**: % of milestones with a real catalog match at
  launch (a direct measure of catalog coverage vs. gaps); % of matched
  milestones actually enrolled/practiced within 30 days.

## Domain D — Learning Intelligence

Restructured per Decisions 10 and 12 into a mandatory rule-based baseline
plus an optional, strictly validated AI-enhanced layer — applied
identically to both Learning Recommendation and Daily Recommendation.

### D.1 Rule-Based Recommendation Engine (new — ships first, always available, never AI)

- **Purpose**: Guarantee every user always has a useful "what's next"
  suggestion, with zero AI dependency, zero credit cost, and zero
  hallucination risk.
- **User flow**: Always visible by default on the Learning dashboard
  (Learning Recommendation) and the dashboard's Today's Mission/Daily
  Challenge entry point (Daily Recommendation) — no user action required
  to see it.
- **Logic** (deterministic, computed server-side from real data already
  aggregated by `UserContext`/`progressAggregation.ts`): e.g., "first
  incomplete course in your enrolled category" for Learning Recommendation;
  "keep your streak alive" / "practice your weakest topic" for Daily
  Recommendation.
- **Cost**: Zero — no AI provider call, no credit consumption, no rate
  limit interaction.
- **UX behaviour**: Always present; visually the baseline state, with an
  adjacent action to "Get an AI-personalized recommendation" for deeper
  guidance.
- **Success criteria**: Click-through rate, serving as the permanent
  baseline every AI-enhanced version (D.2) must outperform to justify its
  credit cost.

### D.2 AI-Enhanced Learning Recommendation (`learning_recommendation`)

- **Purpose**: A deeper, personalized version of D.1, generated on
  explicit user request ("Get an AI-personalized recommendation"), never
  replacing the always-available baseline.
- **Inputs**: `UserContext.learning`, `practice.weakTopics`, **plus a
  server-assembled list of real candidate courses/topics not yet
  completed** — passed into the prompt as the closed set of options the
  model may choose from.
- **Outputs**: `{ recommendedCourseSlug | recommendedTopicSlug, reason
  (under 30 words) }` — **the referenced slug must always be validated
  against the real catalog before being shown; this is a hard
  requirement with no exception**, unlike Career Roadmap's more flexible
  two-layer approach. If the model's output doesn't resolve to a real
  candidate from the list it was given, the response is rejected and the
  UI falls back to D.1 rather than ever showing an invalid reference.
- **Prompt strategy**: **Needs a new prompt builder** (still the only
  missing one, alongside D.4). Must take the candidate list as input,
  not ask the model to recall catalog content from memory.
- **Context required**: `learning`, `practice.weakTopics`, the
  server-assembled candidate list.
- **AI provider usage**: `gemini-3-flash-preview`, non-streaming.
- **Cost model**: Very small, bounded output.
- **Credit consumption**: 1 credit, user-triggered.
- **Caching strategy**: ~24h TTL.
- **Error handling / Fallback behaviour**: **Any failure — provider
  error, rate limit, out of credits, or a non-matching slug — silently
  falls back to showing D.1's rule-based recommendation. No
  `AIErrorState` is ever shown for this feature.** This is a deliberate
  exception to the otherwise-uniform error-handling pattern used by every
  other feature in this spec: the user should never see "AI failed," only
  ever see a useful recommendation, AI-personalized when available,
  rule-based otherwise.
- **Privacy considerations**: No free-text PII.
- **UX behaviour**: Clearly marked as the enhanced/personalized version
  once shown, replacing the baseline card in place rather than adding a
  second card.
- **Success criteria**: Click-through rate compared directly against
  D.1's baseline rate — the credit cost is only justified if this
  measurably outperforms the free version.

### D.3 AI-Enhanced Daily Recommendation (`daily_recommendation`)

Same two-layer structure as D.2, applied to the daily-nudge use case.
Outputs: `{ message (short, motivating), suggestedAction: { type:
"lesson"|"practice"|"interview", slug } }` — same mandatory
slug-validation-or-fallback-to-D.1 rule. Same silent-fallback error
handling. Smallest output/cost in the entire spec; strongest caching case
(once per calendar day per user).

## Domain E — AI Workspace (formerly "Career Coach," unified per Decision 6)

### E.1 AI Workspace — Overview

**ReSee has one AI conversational surface, not two.** The existing
General Chat Assistant backend (`/api/chat/stream`, already
security-hardened) becomes the shared infrastructure for **both** modes
below: same conversation UI, same session handling, same message
history, same streaming transport. What differs between modes is
*behavior*, not *plumbing*.

A mode switch lets the user choose which mode a conversation runs in.

### E.2 General AI Assistant mode

- **Purpose**: General-purpose conversation — document assistance,
  coding help, general questions — exactly what the existing Chat
  Assistant already does today.
- **Behaviour**: No `UserContext` grounding beyond what's already
  live today; multi-turn, streaming, live-search-augmented (unchanged
  from the current implementation).
- **Credit consumption**: **0 — unmetered**, preserving current live
  behavior exactly. This mode is explicitly out of the credit-metering
  system.
- **Everything else** (error handling, privacy, disclaimers): unchanged
  from the already-shipped, already-secured Chat Assistant.

### E.3 Career Coach mode (`career_coaching`)

- **Purpose**: Career-focused guidance, fully grounded in the user's real
  platform activity — resume-aware, learning-aware, interview-aware,
  job-aware.
- **User flow**: User switches the AI Workspace to Career Coach mode →
  starts or continues a conversation → the shared conversation UI renders
  identically to General mode, but responses are grounded in
  `UserContext` and the mode is credit-metered.
- **Inputs**: `userMessage` + conversation history within the current
  session (per Decision 2's session-based billing, prior exchanges in
  the same session are available context, unlike v1.0's original
  strictly-single-turn design).
- **Outputs**: Grounded, career-focused replies with suggested next
  actions — the underlying `CareerCoachingResult`-style structure from
  v1.0 (`reply`, `suggestedActions[]`) still applies per-turn within the
  session, even though billing is now per-session rather than per-turn.
- **Prompt strategy**: Uses the full `UserContext` (career goal, target
  career, skill level, resume summary, learning/interview/job stats) —
  broader context inclusion than v1.0's original narrower slice, since
  this mode is now explicitly positioned as the "full context" mode
  distinguishing it from General Assistant mode.
- **Context required**: The complete `UserContext` object.
- **AI provider usage**: `gemini-3-flash-preview`, **streaming** (§1.4 —
  shared transport with General mode).
- **Cost model**: Moderate — grounded replies plus growing session
  history within a conversation increase input size turn-over-turn, but
  output per turn remains short.
- **Credit consumption**: **1 credit per session** (Decision 2), not per
  message — a session covers multiple back-and-forth exchanges.
- **Caching strategy**: None — conversational by nature.
- **Error handling**: Standard `AIError` mapping; a failure mid-session
  doesn't consume a new credit if the session credit was already charged
  at session start.
- **Fallback behaviour**: On failure, a friendly retry within the same
  session — never a full session restart or a second credit charge for
  the retry.
- **Privacy considerations**: `userMessage` and full `UserContext` flow
  into the prompt — never logged raw (§1.11); only metadata.
- **UX behaviour**: Visually the same shared workspace as General mode,
  distinguished by an explicit mode indicator and the credit-cost framing
  ("this session uses 1 credit") shown before a new session starts.
- **Success criteria**: Sessions per active user per week; average
  exchanges per session (validates that session-based billing is
  actually being used conversationally, not just as a relabeled
  per-message charge).

---

# Part 3 — Phased Implementation Roadmap

Updated to reflect every approved decision's scope impact. Supersedes the
Part 3 roadmap in `docs/architecture/ai-implementation-roadmap.md` and
v1.0 of this document.

| Phase | Scope | Notes |
|---|---|---|
| **0 — done** | Foundation hardening + security hardening | Complete |
| **0.5 — new, blocks Phase 1** | Transactional + idempotent credit deduction (Decision 8); lazy monthly reset (Decision 9); "Delete my AI history" privacy feature (Decision 7) | Trust/integrity infrastructure — must land before any paid AI feature ships, not bundled loosely into Phase 1 |
| **1** | Resume Analysis | Unchanged in scope from v1.0 |
| **2** | Resume Rewrite | Unchanged in scope from v1.0 |
| **3** | Interview Post-Session Evaluation + Deep AI Analysis | **Larger than v1.0's scope** — new multi-score prompt builder, a new RLS-scoped table for session-level evaluations (separate from the existing per-question feedback shape), and an automatic-generation trigger path with its own failure/fallback design (no user-initiated retry moment by default) |
| **4** | Job Match | Adds the tiered-label mapping (§C.1) and the detail-page-only default; the future list-view opt-in preference is explicitly out of scope for this phase |
| **5** | Skill Gap + Career Roadmap (two-layer) | **Larger than v1.0's scope** — Roadmap now requires building the deterministic catalog-mapping engine (Layer 2) alongside the AI generation layer (Layer 1); this is real, non-trivial matching logic, not just a prompt change |
| **6** | AI Workspace (Career Coach mode + General Assistant mode unification) | **Substantially larger than v1.0's "Career Coaching" scope** — this phase now includes migrating/refactoring the existing `/api/chat/stream` backend into a shared, mode-switchable surface, plus building the mode switch UI itself |
| **7a** | Rule-based Recommendation Engine (Learning + Daily) | **Can ship independently, any time, with no dependency on any other AI phase** — zero AI cost, zero risk; recommended to ship early regardless of overall AI roadmap sequencing (Decision 10) |
| **7b** | AI-Enhanced Learning + Daily Recommendation | Depends on 7a existing as the fallback target; requires the 2 new prompt builders (still the only missing ones) built with mandatory slug-validation from day one |
| **8 — ongoing** | 60-day log purge job (Decision 7 — still needs real scheduling infrastructure, unlike the lazy credit-reset approach), Admin AI Dashboard maturity, second-provider evaluation, model-tier activation for Pro/Enterprise (§1.5) | Runs alongside all of the above, not sequential |

**Sequencing note**: Phase 0.5's log-purge job and Phase 9's log-purge job
are the same work item, listed once under Phase 8 since — unlike the
credit reset (solved lazily, no scheduler needed) — a 60-day purge
genuinely must run independent of user activity and still needs a real
scheduling mechanism to be decided at implementation time.

Each phase closes with the same verification discipline as prior sprints:
`tsc`/lint clean, a scoped `git status` check, and a live Supabase check
confirming any new schema landed.

---

# Part 4 — Approved Decisions Log

All 12 decisions reviewed and approved. Full reasoning for each lives in
the relevant Part 1/2/3 section referenced below; this log is the
at-a-glance record of what was decided.

| # | Decision | Approved answer | Detail |
|---|---|---|---|
| 1 | Free vs. Premium AI features | Hybrid — every feature always available to everyone; Free vs. Pro differ by credits, quality, context size, depth, priority, and future model selection. No permanent feature locking. | §1.1 |
| 2 | Per-feature credit costs | Flat across all plans; tier affects quality/depth/priority/model, never price. Career Coach billed 1 credit/session (not per message). | §1.2 |
| 3 | Free-tier credit generosity | 15 credits/month (not 20); resets monthly; no rollover. Pro/Enterprise unchanged. | §1.1, §1.2 |
| 4 | First-use AI disclaimer | Persistent `AIDisclosureBadge` only, every response; no blocking modal. Future high-risk-only acknowledgments reserved for genuinely high-risk actions. | §1.10 |
| 5 | Interview Evaluation granularity | Automatic post-session evaluation (1 credit, 4 sub-scores + qualitative synthesis) for every completed interview; optional Deep AI Analysis per question (1 credit each) for advanced drill-down. | §2 Domain B |
| 6 | Career Coaching vs. Chat Assistant | Unified into one AI Workspace with a mode switch (Career Coach / General AI Assistant), sharing conversation UI, session handling, history, and infrastructure. Behavior — not plumbing — differs by mode. | §2 Domain E |
| 7 | Data retention policy | 60-day rolling retention (not 90) for request metadata; anonymized aggregates only after that. Raw user-generated content never stored, ever. New "Delete my AI history" self-service privacy feature. | §1.11 |
| 8 | Credit deduction consistency | Fully transactional (atomic balance + ledger write) plus an idempotency-key mechanism preventing double-deduction on retries/duplicates. Hard prerequisite before Phase 1. | §1.2, Phase 0.5 |
| 9 | Monthly credit reset mechanism | Lazy, on-access reset — no scheduler. Checked atomically on every subscription access; resets balance, advances period, logs a "Monthly Credit Reset" ledger entry. | §1.2 |
| 10 | Learning/Daily Recommendation sequencing | Rule-based engine ships first, always free, always available, zero AI dependency. AI-enhanced layer is opt-in on top. Any AI failure silently falls back to the rule-based version — no error ever shown for this feature. | §2 Domain D |
| 11 | Job Match placement & labeling | Detail-page-only by default for all users (future opt-in list-view preference for advanced users). Tiered, always-encouraging labels (Excellent/Good/Potential Match) — never negative wording. | §2 Domain C.1 |
| 12 | Roadmap/Learning Rec catalog grounding | Learning Recommendation: mandatory slug-validation against the real catalog, no exceptions. Career Roadmap: two-layer design — AI generates guidance (skills/technologies/objectives) only, a separate deterministic layer attaches real course matches or clearly marks "not available." AI never invents ReSee course names in either feature. | §2 Domain C.3, Domain D |

---

ReSee AI Product Specification — companion to
`docs/architecture/ai-architecture.md`, `docs/architecture/ai-implementation-roadmap.md`,
and `docs/architecture/ai-legacy-migration-strategy.md`. Update this
document as features actually ship — mark each domain's status as it
moves from Approved to Shipped.
