---
status: Accepted
last-reviewed: 2026-07-31
stack: Next.js 16 App Router, React 19, TypeScript, Supabase, Vercel
---

# ReSee — Enterprise System Architecture

How every layer of ReSee communicates today, and the target design for
scaling to millions of users. Builds directly on
`docs/architecture/database-architecture.md` and
`docs/architecture/ai-architecture.md` — this is the layer that sits above
both.

**Status legend:** 🟢 Shipped in production · 🟡 Proposed extension

---

## Reality Check — What's Shipped vs. Proposed

- **① Presentation — 🟢 shipped.** Full App Router structure under
  `app/(dashboard)/**`, ~40 shared hooks, feature-organized
  `components/**`.
- **② API — 🟢 shipped.** Every route under `app/api/**` follows one
  convention: `getServerSupabase()` → `auth.getUser()` → 401 JSON →
  query → response. No shared validation middleware yet — each route
  validates inline.
- **③ Business — collapsed into API + lib/.** No `services/` folder
  exists. Business rules live inline in route handlers, plus a handful of
  pure-logic `lib/*.ts` files (`careerScore.ts`, `progressAggregation.ts`,
  `resumeVersioning.ts`). The one domain with a real, separate
  orchestration layer is AI — `lib/ai/**`, built and working.
- **④ Repository — collapsed into API + lib/.** No query-builder
  abstraction exists. Every route calls the Supabase client directly. A
  deliberate simplicity choice at current scale, not an oversight.
- **⑤ Infrastructure — 🟢 shipped.** Supabase (Postgres + Auth +
  Storage), Vercel hosting/CDN. No queue, no cache layer beyond
  `ai_response_cache`, no error-tracking service, no email service wired
  up yet.

Background Processing, Event-Driven Architecture, formal Observability,
and the Business/Repository layer split are **proposed target designs**
in this document — greenfield, not refactors of something broken.

---

## High-Level Architecture

Every inbound request crosses the same spine. The AI Orchestrator and
(proposed) Event Bus / Workers are lateral systems the spine calls into,
not separate request paths.

```mermaid
flowchart TB
  Client["Browser Client"] -->|HTTPS| Edge["Vercel Edge Network + CDN"]
  Edge --> Presentation["Presentation Layer\nNext.js App Router"]
  Presentation --> API["API Layer\nRoute Handlers + Validation + Auth"]
  API --> Business["Business Layer\nLearning / Practice / Resume / Interview / Jobs / Analytics Services"]
  API --> AIOrch["AI Orchestrator (lib/ai) — shipped"]
  Business --> Repo["Repository Layer\nQuery Builders + Transactions"]
  AIOrch --> Repo
  Repo --> Supabase["Supabase\nPostgres + Auth + Storage"]
  AIOrch --> Provider["AI Provider\n(Gemini, provider-independent interface)"]
  Business -.proposed.-> Events["Event Bus\ndomain_events outbox table"]
  Events -.proposed.-> Workers["Background Workers"]
  Workers -.proposed.-> Repo
  Workers -.proposed.-> Email["Email Service"]
  Workers -.proposed.-> Notif["Notification Delivery"]
```

## Layered Architecture

```mermaid
flowchart TB
  subgraph L1["1 · Presentation Layer — shipped"]
    P1["App Router pages: app/(dashboard)/**"]
    P2["Shared Components: components/**"]
    P3["Layout System: layout.tsx per route group"]
  end
  subgraph L2["2 · API Layer — shipped"]
    A1["Route Handlers: app/api/**/route.ts"]
    A2["Request Validation (inline today)"]
    A3["Authentication: getServerSupabase + auth.getUser"]
    A4["Authorization: per-route re-check, requireAdmin() for /admin"]
  end
  subgraph L3["3 · Business Layer — partially shipped"]
    B1["Learning / Practice / Resume / Interview / Jobs Services — proposed extraction"]
    B2["AI Service → AI Orchestrator (lib/ai) — shipped"]
    B3["Analytics Service — proposed"]
  end
  subgraph L4["4 · Repository Layer — proposed"]
    R1["Query Builders per table/domain"]
    R2["Transactions"]
  end
  subgraph L5["5 · Infrastructure Layer — shipped"]
    I1["Supabase Postgres + Auth"]
    I2["Storage (resume assets, attachments)"]
    I3["Email — not yet integrated"]
    I4["Logging — ai_requests only today"]
  end
  L1 --> L2 --> L3 --> L4 --> L5
```

Today, L3 and L4 are the *same file* as L2 for every domain except AI.
The proposed extraction (see Folder Structure in
`docs/README.md`'s repository structure) splits them without moving
L1/L2/L5, which stay as-is.

---

## Request Flow

Canonical target flow, matching the brief exactly:

```mermaid
sequenceDiagram
  participant UI
  participant API as API Route
  participant Val as Validation
  participant Svc as Business Service
  participant Repo as Repository
  participant DB as Supabase
  UI->>API: HTTP request (cookies = session)
  API->>API: getServerSupabase() + auth.getUser()
  API->>Val: parse & validate payload
  Val-->>API: typed input or 400
  API->>Svc: call domain service
  Svc->>Repo: query/mutate via repository
  Repo->>DB: Postgres query (RLS-enforced)
  DB-->>Repo: rows
  Repo-->>Svc: typed result
  Svc-->>API: domain result
  API-->>UI: JSON response
```

**Today**, Validation/Service/Repository collapse into the route handler
itself — e.g. `app/api/learning/courses/route.ts` validates the user
inline, queries `courses`/`enrollments`/`lesson_progress` directly, and
shapes the response in one function.

| Module | Real entry points today | Proposed Service | Proposed Repository | Core tables touched |
|---|---|---|---|---|
| Learning | app/api/learning/** | LearningService | CourseRepository, ProgressRepository | courses, lessons, enrollments, lesson_progress, quiz_attempts |
| Practice | app/api/practice/** | PracticeService | PracticeRepository, AttemptRepository | practice_topics, practice_attempts, mock_test_attempts |
| Resume | app/api/resumes/** | ResumeService | ResumeRepository | resumes, resume_versions |
| Interview | app/api/interviews/** | InterviewService | InterviewRepository | interview_sets, interview_questions, interview_attempts |
| Jobs | app/api/jobs/** | JobsService | JobsRepository | jobs, saved_jobs, job_applications, job_preferences |
| AI | — (no route calls it yet) | AIService (thin wrapper) | `lib/ai/requestManager.ts` already is the orchestrator | ai_requests, ai_response_cache, ai_user_memory, user_subscriptions |
| Analytics | app/api/progress/** | AnalyticsService | AnalyticsRepository | career_score_history, achievements, (proposed) daily_activity_snapshots |

---

## AI Orchestrator — 🟢 shipped (`lib/ai/**`)

This is the one business-layer domain already fully extracted.
`runAIRequest()` in `lib/ai/requestManager.ts` is the single entry point
every future AI feature calls — nothing in the running app calls it yet,
but the pipeline itself is real, working code, not a design sketch. Full
detail in `docs/architecture/ai-architecture.md`.

```mermaid
flowchart TB
  Feature["Future AI Feature Route"] --> Memory["User Memory\ngetOrRefreshMemory() — 24h cache"]
  Memory --> Context["Context Builder\nbuildUserContext() — aggregates Learning/Practice/Resume/Interview/Jobs"]
  Context --> Prompt["Prompt Builder\nlib/ai/prompts/*.ts — one typed builder per feature"]
  Prompt --> Run["runAIRequest() — Orchestrator Entry Point"]
  Run --> V["Input Validation\nsecurity.ts"]
  V --> RL["Rate Limit Check\nrateLimiter.ts — Postgres sliding window"]
  RL --> Cr["Credit Check\ncredits.ts"]
  Cr --> Ca{"Cache Hit?\ncache.ts"}
  Ca -->|Yes| Ret["Return Cached Response"]
  Ca -->|No| Prov["Provider Selection\nproviders/index.ts → Gemini (provider-independent interface)"]
  Prov --> Parse["Response Validation\nresponseParser.ts — safeJsonParse, never throws"]
  Parse --> Log["Logging\nlogger.ts → ai_requests"]
  Log --> Ded["Deduct Credits"]
  Ded --> Write["Write Cache\nai_response_cache"]
  Write --> Ret
  Log -.-> Analytics["Analytics\nai_requests is the source table for AI Metrics"]
```

**Provider independence:** every adapter implements the `AIProvider`
interface (`providers/types.ts`); Gemini is the only one implemented
today because it's the only SDK this codebase has proven in production —
adding OpenAI/Anthropic later is a new file, zero changes to
`requestManager.ts`.

---

## Background Processing — 🟡 proposed, fully new

Nothing in this codebase runs outside a request today — no queue, no
cron, no worker process. Given the existing Postgres-only infrastructure
philosophy (rate limiting and caching are both Postgres-backed rather
than Redis), the proposed design uses a **transactional outbox** pattern
rather than introducing a new message broker.

```mermaid
flowchart LR
  App["App Code / Event Bus"] --> Outbox["job_queue table\n(Postgres outbox)"]
  Outbox --> Dispatcher["Worker Dispatcher\nVercel Cron / pg_cron poll"]
  Dispatcher --> Q1["AI Request Jobs"]
  Dispatcher --> Q2["Email Delivery"]
  Dispatcher --> Q3["Notification Delivery"]
  Dispatcher --> Q4["Resume PDF Generation"]
  Dispatcher --> Q5["Analytics Aggregation"]
  Dispatcher --> Q6["Scheduled Jobs\n(credit refills, memory refresh)"]
  Q1 & Q2 & Q3 & Q4 & Q5 & Q6 --> Check{"Succeeded?"}
  Check -->|No, attempt < 5| Backoff["Exponential Backoff\n(30s, 2m, 8m, 32m, 2h)"]
  Backoff --> Dispatcher
  Check -->|No, attempt = 5| DLQ["Dead-Letter Table\njob_queue_failed"]
  Check -->|Yes| Done["status = completed"]
```

**job_queue** (proposed table)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| job_type | text | ai_request / email / notification / resume_pdf / analytics_rollup / scheduled |
| payload | jsonb | job-specific arguments |
| status | text | pending / processing / completed / failed |
| attempts, max_attempts | int | default max 5 |
| run_after | timestamptz | backoff scheduling |
| last_error | text | for the dead-letter table / debugging |

- **Resume PDF generation** is currently client-side (`jspdf` in the
  browser). Moving it to a worker only matters once server-rendered/
  queued export is a real feature.
- **Retry strategy:** exponential backoff via `run_after`, capped at 5
  attempts, then dead-lettered for manual/alerted review — mirrors the
  retry-on-429/5xx pattern already proven in `lib/ai/providers/gemini.ts`.
- **Failure handling:** a failed job never blocks its triggering request
  — the outbox row is written in the same transaction as the domain
  change.

---

## Event-Driven Architecture — 🟡 proposed, fully new

An internal `domain_events` table (the same outbox row that feeds
`job_queue`) recording what happened, so downstream consumers react
without the originating service knowing who's listening.

```mermaid
flowchart LR
  A["resume.updated"] --> B["career_score.updated"]
  B --> C["job_match.refresh"]
  C --> D["recommendations.refresh"]
  D --> E["notification.created"]
```

| Event | Emitted by | Consumers → side effects |
|---|---|---|
| learning.lesson_completed | LearningService | streak update, career_score.learning_progress recompute, achievement check |
| practice.attempt_completed | PracticeService | career_score.technical_skills recompute, weak-topic recommendation refresh |
| interview.attempt_completed | InterviewService | career_score.interview_readiness recompute, notification.created (summary ready) |
| jobs.application_submitted | JobsService | notification.created (confirmation), analytics event log |
| jobs.application_status_changed | JobsService | notification.created (status update) |
| subscription.changed | AI credits/billing flow | user_subscriptions refresh, notification.created (plan change) |

**Mechanism:** a service writes its domain change and a `domain_events`
row in the same Postgres transaction (transactional outbox — no dual-
write inconsistency). The worker dispatcher polls `domain_events`, fans
each event out to its registered consumers, and enqueues any resulting
`job_queue` rows.

---

## Security

- **JWT Flow — 🟢 shipped.** Supabase Auth issues a JWT on login, stored
  as an httpOnly cookie via `@supabase/ssr`. `website/proxy.ts` reads it
  on every matched route, calls `auth.getUser()` to verify server-side,
  and redirects unauthenticated requests to `/login` (or `/admin/login`)
  before the route even renders.
- **Row Level Security — 🟢 shipped.** Full catalog in
  `docs/architecture/database-architecture.md`.
- **API Authorization — 🟢 shipped.** Every route independently
  re-verifies `auth.getUser()` even though `proxy.ts` already redirected
  unauthenticated page loads — a direct API call bypasses the proxy layer
  entirely. Admin routes additionally call `requireAdmin()`
  (`lib/adminAuth.ts`).
- **Rate Limiting — 🟢 shipped for AI, 🟡 proposed app-wide.**
  `lib/ai/rateLimiter.ts` is a real, working Postgres sliding-window
  limiter (10 req/60s per user per feature), scoped to AI only today.
  Recommendation: extend the identical pattern to auth endpoints and any
  future public-write endpoint.
- **Audit Logging — 🟡 proposed.** No audit trail exists today beyond
  RLS itself. See the proposed `admin_audit_log` table in the Database
  Architecture doc.
- **Input Validation — ad hoc today, 🟡 proposed schema layer.** No
  schema-validation library is installed (no Zod, no Yup) — every route
  hand-checks its payload inline. Recommendation: introduce Zod schemas
  per route, colocated with each route (`route.schema.ts`).

## Observability — mostly proposed

| Category | Status |
|---|---|
| Structured Logging | 🟡 Proposed — today: `console.error` per route, unstructured |
| Error Tracking | 🟡 Proposed — no error-tracking service integrated |
| Performance Monitoring | 🟡 Proposed — Vercel's Web Vitals covers page-level; no API-route latency dashboard yet |
| API Metrics | 🟡 Proposed — no per-route request-count/error-rate table exists |
| AI Metrics | 🟢 Shipped — `ai_requests` already carries feature, provider, model, status, token counts, and latency per call |

## Scalability

| Tier | Focus |
|---|---|
| **100K users** | Current architecture handles this with no structural change. Add route-segment caching/ISR for public catalog pages. Vercel serverless auto-scales per request. Supabase connection pooling (Supavisor) enabled. |
| **1 million users** | Introduce `daily_activity_snapshots` rollup. Introduce the Background Worker queue. Add a shared edge/KV cache in front of catalog reads. Read replicas for read-heavy catalog queries. |
| **10 million users** | Time-partition `ai_requests`, `domain_events`, and activity-log tables by month. Move AI provider calls to a dedicated worker pool. CDN-cache every public catalog page fully, invalidated from the event bus. Consider splitting Postgres by domain only if write throughput becomes the bottleneck — not before, since cross-domain joins (e.g. the AI Context Engine) get materially harder once split. |

---

## Best Practices

- **Extract, don't rewrite** — every proposal here (services,
  repositories, event bus, workers) is additive to the current file
  layout.
- **One orchestrator per cross-cutting concern** — AI has
  `requestManager.ts`. Background Workers and the Event Bus should get
  the same single-entry-point discipline.
- **Postgres-first, add infra only when proven necessary** — introduce
  Redis/a message broker only when a measured bottleneck demands it.
- **RLS is the floor, not the whole wall** — keep adding layer-
  appropriate checks (route re-checks, `requireAdmin()`, future Zod
  validation) rather than relying on RLS to do everything.
- **Metrics table shape, once, everywhere** — `ai_requests`' shape is
  the proven template for any future metrics table.
- **Ship RBAC + audit log before the second admin workflow.**

---

ReSee Enterprise System Architecture — companion to
`docs/architecture/database-architecture.md` and
`docs/architecture/ai-architecture.md`. Documentation only; no code,
migration, or configuration was changed to produce this page.
