---
status: Accepted
version: 1.0
last-reviewed: 2026-07-31
companion-docs: docs/architecture/database-architecture.md, docs/architecture/system-architecture.md
---

# ReSee — Product Requirements Document

The official product reference for ReSee: what it is, who it's for, what it
does today, and where it's going next. Written against the platform as it
actually exists — nine shipped modules plus a documented near-term roadmap
— not an aspirational rewrite.

For the one-page framing, see `docs/product/vision.md`.

---

## 1. Product Overview

See `docs/product/vision.md` for What is ReSee / Why it was created /
Target users / Problems it solves / Vision / Mission — extracted there in
full so it stays in sync as its own document.

---

## 2. User Personas

### The Fresher
`role_type: fresher` · onboarding: goal + skill_level

- **Goals** — Land a first job; build credible, demonstrable skills fast.
- **Pain points** — No work history to put on a resume; zero real
  interview experience; doesn't know which skills employers actually
  screen for.
- **Motivations** — Visible proof of progress (a score, a streak, a
  completed course) that offsets the anxiety of having "nothing" to show
  yet.
- **Success criteria** — ATS-friendly resume generated, first mock
  interview completed, first job application submitted.

### The Experienced Professional
`role_type: experienced` · target_career set

- **Goals** — Move to a better role/company, or grow within their current
  track.
- **Pain points** — Resume undersells real project impact; interview
  practice at their actual seniority level is hard to find; job boards
  are noisy and unfiltered.
- **Motivations** — Efficiency — they don't want a beginner course, they
  want a sharp resume and a targeted shortlist.
- **Success criteria** — Modern-template resume reflecting real
  experience; interview sets at 3-5-years/5-plus-years level; applications
  tracked to an offer.

### The Career Switcher
target_career ≠ current field

- **Goals** — Re-enter the job market in a field they have no formal
  track record in.
- **Pain points** — Years of professional experience that don't map to
  `role_type`'s fresher/experienced binary in their new field; needs
  beginner-level learning content despite being a working professional.
- **Motivations** — A structured path that doesn't assume either total
  inexperience or domain expertise.
- **Success criteria** — Completes foundational Learning content for the
  new track, resume repositions prior experience as transferable skills.

### The Student
goal: "explore" · pre-Jobs stage

- **Goals** — Explore what a career path in tech actually requires before
  committing.
- **Pain points** — Doesn't yet know which career to target; overwhelmed
  by course catalogs elsewhere with no guided order.
- **Motivations** — Low-stakes exploration — streaks and small wins
  matter more than job-readiness pressure this early.
- **Success criteria** — Consistent learning streak; a target career
  chosen with confidence by the time they need one.

### Recruiters — *Future*
No account type exists today.

- **Goals** — Post verified openings, browse candidates who match a
  role's requirements directly from ReSee's own skill graph.
- **Pain points (anticipated)** — Today's `jobs` catalog is admin/seed-
  managed with free-text company names — no recruiter-owned posting flow
  exists.
- **Success criteria** — A recruiter can post a role and receive
  qualified, ReSee-verified applicants without leaving the platform.

### Colleges — *Future*
No institutional account type exists today.

- **Goals** — Bulk-onboard a cohort, track aggregate placement-readiness
  across a batch.
- **Pain points (anticipated)** — No multi-tenant/organization concept
  exists in `profiles` or `admin_users` today.
- **Success criteria** — A placement cell can see cohort-wide Career
  Score distribution and nudge at-risk students.

---

## 3. User Journeys

All three journeys share one spine — **Signup → Onboarding → Learning →
Practice → Resume → Mock Interview → Jobs → Career Growth** — but each
persona moves through it with different weight and order.

### Fresher journey

```
Signup → Onboarding (goal, skill_level, fresher) → Learning (heavy) →
Practice (heavy) → Resume (ats-friendly template) →
Mock Interview (fresher level) → Jobs (fresher filter) → Career Growth
```

### Experienced professional journey

```
Signup → Onboarding (experienced) → Resume (modern template) →
Mock Interview (3-5y / 5+y) → Jobs (experience + salary filter) →
Learning / Practice (targeted skill gaps only) → Career Growth
```

Learning and Practice move to the back of this journey, used selectively
rather than sequentially — an experienced user doesn't need the
foundational path a fresher does.

### Career switcher journey

```
Signup → Onboarding (new target_career) →
Learning (foundational, full course path) → Practice (beginner topics) →
Resume (repositions prior experience) →
Mock Interview (fresher level, new field) → Jobs (entry-level, new field) →
Career Growth
```

Structurally identical to the Fresher journey today — **this is a known
product gap**, not a designed distinction: the platform doesn't yet
capture "experienced professional, fresher in this new field" as its own
state. See Business Rules §8 and the Roadmap.

---

## 4. Functional Requirements

### Authentication & Onboarding — shipped

- **Purpose** — Establish identity and capture the profile signals every
  other module personalizes against.
- **Features** — Signup / login / forgot-password / reset; multi-step
  onboarding: goal, skill_level, target_career, role_type.
- **Inputs** — Email + password; onboarding step answers.
- **Outputs** — Authenticated session (cookie); populated `profiles` row.
- **Business rules** — Onboarding must be completed before any protected
  route is reachable.
- **Edge cases** — Session expired mid-session; user navigates to
  `/onboarding` after already completing it (redirected to dashboard
  unless `?edit=true`).
- **Dependencies** — Supabase Auth, `proxy.ts` route protection.

### Dashboard — shipped

- **Purpose** — Single home view aggregating every module's state into
  one glance.
- **Features** — Career Score gauge + timeline; Continue Learning card;
  Today's Mission; Achievements strip; feature grid to every module.
- **Inputs** — Read-only aggregation across every module.
- **Outputs** — None — a hub, not a data-entry surface.
- **Business rules** — A brand-new user sees honest empty/starter
  states — never fabricated activity.
- **Edge cases** — Zero enrollments, zero practice attempts, zero
  resumes — every card degrades gracefully.
- **Dependencies** — Every other module's read APIs.

### Learning — shipped

- **Purpose** — Structured, sequential skill-building content.
- **Features** — Category → Course → Module → Lesson/Quiz hierarchy;
  enrollment, lesson completion, quiz attempts; streaks and total
  learning minutes.
- **Inputs** — Enrollment action, lesson-complete action, quiz answers.
- **Outputs** — Module completion %, quiz pass/fail + score, streak
  update.
- **Business rules** — Module completion = quiz passed (100%) OR
  lessons-completed ratio capped at 60% without a passed quiz.
- **Edge cases** — Course marked unavailable ("Coming Soon") mid-
  enrollment; quiz retaken after already passing.
- **Dependencies** — Skills catalog (optional linkage), Progress module.

### Practice & Assessment — shipped

- **Purpose** — Topic-based drilling and timed mock tests to validate
  readiness.
- **Features** — Topic practice (single/multi-select/true-false); timed
  mock tests reusing the same question bank; bookmarks, question reports,
  resumable attempts.
- **Inputs** — Answer selections, session start/submit.
- **Outputs** — Score, correct count, per-topic accuracy feeding the
  skill graph.
- **Business rules** — Exactly one in-progress attempt per topic/test at
  a time; answer keys never reach the client.
- **Edge cases** — Attempt abandoned mid-session (resumable via "Continue
  Practice"); a reported question awaiting no formal review workflow yet.
- **Dependencies** — Skills catalog, Progress module.

### Resume Studio — shipped

- **Purpose** — Generate a polished, role-appropriate resume without a
  blank-page problem.
- **Features** — 7-step wizard (userType → personal info → education →
  experience → projects → skills → certifications); auto-selected
  template (ATS-friendly for freshers, Modern for experienced); PDF
  export, version history with restore.
- **Inputs** — Wizard form answers.
- **Outputs** — Rendered resume preview, downloadable PDF, version
  snapshot.
- **Business rules** — Template re-derives from profile on every save,
  never user-chosen directly; version snapshot is throttled, not on
  every keystroke.
- **Edge cases** — User edits `role_type` after already building a resume
  — template silently changes on next save.
- **Dependencies** — Profile (userType), PDF export library.

### Mock Interview — shipped

- **Purpose** — Realistic, role- and level-specific interview rehearsal.
- **Features** — Category (HR / Technical / Behavioural) × Role ×
  Experience level; open-ended question runner with a timer; interview
  history with delete.
- **Inputs** — Selected set, free-text answers.
- **Outputs** — Completion summary (questions answered, time taken) — **no
  AI-graded feedback yet, by design**.
- **Business rules** — One in-progress attempt per set; a set is
  "available" only when real content exists for that exact
  category×role×level combination.
- **Edge cases** — User picks a role/level combination with no authored
  set → honest "not available yet," never a fabricated set.
- **Dependencies** — Interview role/category catalog; future AI
  evaluation feature (not yet wired).

### Jobs & Career Hub — shipped

- **Purpose** — Browse, save, and track applications to real postings.
- **Features** — Searchable/filterable job catalog; save for later,
  apply, 5-status Kanban tracker; job preferences (roles, locations, work
  mode).
- **Inputs** — Search/filter criteria, save/apply actions, status
  updates.
- **Outputs** — Filtered listing, saved list, application board.
- **Business rules** — One application row per user per job; `archived`
  is terminal, no delete or re-apply to the same posting.
- **Edge cases** — Zero postings match a filter combination → empty
  state, not a silently broadened search.
- **Dependencies** — Interview role vocabulary (for role_slug alignment),
  Job preferences.

### AI — partially shipped

- **Purpose** — AI-assisted career guidance across every module.
- **Features (live today)** — Career chat assistant, PDF chat, document
  summarizer; standalone AI resume analyzer, quiz-from-file generator,
  interview-question generator from a PDF.
- **Features (built, not yet live)** — Resume analysis/rewrite scored
  against the real resume builder, job match, interview evaluation,
  career roadmap, skill gap, career coaching, learning & daily
  recommendations — architecture complete, zero UI entry point.
- **Inputs** — User prompt/document; for the not-yet-live features, the
  full aggregated User Context.
- **Outputs** — Generated text/analysis; credit deduction.
- **Business rules** — Every AI call is credit-metered against the
  user's subscription plan (once wired); rate-limited 10 req/60s per
  feature.
- **Edge cases** — Provider timeout/5xx (retried with backoff),
  out-of-credits, malformed model response (never surfaced raw to the
  user).
- **Dependencies** — Gemini provider, User Context Engine,
  subscription/credits ledger.

### Progress & Career Score — shipped

- **Purpose** — One quantified view of career readiness across all
  modules.
- **Features** — Per-skill radar (Learning + Practice blended);
  achievements; Career Score with 6 sub-metrics.
- **Inputs** — None directly — fully derived from other modules'
  activity.
- **Outputs** — Skill percentages, achievement unlocks, Career Score
  history entries.
- **Business rules** — Only `resume_quality` is actually computed
  today; the other 5 sub-metrics are honestly stubbed `not_started`, not
  faked.
- **Edge cases** — A skill with zero linked content anywhere shows 0%,
  not "N/A" or a hidden card.
- **Dependencies** — Learning, Practice, and (once wired) the AI Context
  Engine for the remaining 5 sub-metrics.

### Admin & CMS — shipped

- **Purpose** — Internal content management and platform oversight.
- **Features** — Course/lesson/quiz authoring, draft → published →
  archived workflow; admin identity: super_admin / admin /
  content_manager.
- **Inputs** — Admin-authored content, status changes.
- **Outputs** — Published catalog content visible to all users.
- **Business rules** — Admin grants happen only via a trusted
  server-side action — no client can self-promote.
- **Edge cases** — First admin bootstrap is a manual one-time SQL insert
  — no self-service path by design.
- **Dependencies** — Every content-bearing module (Learning, Practice,
  Jobs).

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Dashboard and module list views render from cached/aggregated queries, not full-table scans; target <300ms p95 for catalog reads. |
| Availability | Vercel-hosted, no single points of failure at the application tier; target 99.9% uptime once SLA-tracked (not formally measured yet). |
| Reliability | Resumable in-progress state (practice/mock-test/interview attempts) survives refresh or device change without data loss. |
| Security | RLS on every table, server-side re-verification on every mutation, credits/admin grants never client-writable. Full detail in `docs/architecture/system-architecture.md`. |
| Accessibility | Keyboard-focusable interactive elements, semantic HTML throughout. No formal WCAG audit has been run yet — proposed for Phase 2. |
| Responsiveness | Every shipped page targets mobile, tablet, and desktop breakpoints; no desktop-only surface exists. |
| Scalability | See `docs/architecture/system-architecture.md`'s 100K/1M/10M tiering. |
| Maintainability | One convention per concern (API auth check, hook shape, RLS pattern) repeated identically across all 9 modules — no module invents its own dialect. |

---

## 6–7. User Stories & Acceptance Criteria

Each story pairs directly with the acceptance criteria that make it
verifiable.

**AUTH-01** — As a new user, I want to complete onboarding once, so that
the platform knows my starting point.
- Cannot reach `/dashboard` until `profiles.onboarding_completed = true`
- Revisiting `/onboarding` after completion redirects to `/dashboard`
  unless `?edit=true`

**LRN-01** — As a fresher, I want a clear course path, so that I don't
have to guess what to learn first.
- Courses are grouped by category with a difficulty label
- Unavailable courses show "Coming Soon," never a broken link

**PRC-01** — As a learner, I want to resume an unfinished practice
session, so that I don't lose progress on a refresh.
- At most one in-progress attempt exists per topic
- "Continue Practice" restores the exact question order and prior answers

**RES-01** — As a fresher, I want to generate an ATS-friendly resume, so
that I can apply confidently.
- A fresher's resume defaults to the ats-friendly template with no manual
  choice required
- PDF export matches the on-screen preview exactly

**INT-01** — As a fresher, I want to rehearse HR, Technical, and
Behavioural interviews at my level, so that the real one feels less
unfamiliar.
- Only sets with real authored content appear as startable
- A completed attempt is visible in Interview History with time taken and
  questions answered

**JOB-01** — As an experienced professional, I want to filter jobs by
experience level and salary, so that I only see relevant postings.
- Filter combinations that match zero postings show an explicit empty
  state
- Saved jobs persist across sessions

**JOB-02** — As a job seeker, I want a Kanban view of my applications, so
that I always know what stage each one is in.
- Status changes persist immediately and reflect in both board and
  history views
- An application marked `archived` cannot be deleted or reopened

**AI-01** — As any user, I want AI features to fail gracefully when I'm
out of credits, so that I understand why nothing happened instead of
seeing an error.
- An out-of-credits response returns a clear, non-technical message
- No partial credit is deducted for a failed request

**PRG-01** — As a user, I want to see which skills I'm weak in, so that I
know what to practice next.
- A skill with zero linked activity shows 0%, never blank or omitted
- The three lowest-scoring skills are surfaced explicitly as "weak
  topics"

**ADM-01** — As a content manager, I want to save a course as a draft
before publishing, so that I can build content without exposing it early.
- A course in `draft` status never appears in the public catalog
- Only `published` courses count toward a user's available catalog

---

## 8. Business Rules

| Area | Rule |
|---|---|
| Resume versions | A version snapshot is taken on throttled save, not every keystroke; restoring a version re-derives the template from that version's userType, never keeps a stale template. |
| Interview history | Exactly one in-progress attempt per set at a time; unlike every other attempt-tracking table in the platform, users may delete interview history entirely. |
| Job application tracking | One application per user per job, ever; `archived` is terminal — no delete, no silent re-application to the same posting. |
| AI credits | Monthly allotment by plan (Free/Pro/Enterprise); every deduction is ledgered; balance is never client-writable, only server-deducted. |
| Subscription limits | Free plan is the default for every account with no explicit subscription row — lazily created on first credit-consuming action, not pre-provisioned at signup. |
| Learning progress | A module counts complete only via a passed quiz (100%) or lesson completion capped at 60% without one — visible progress can never silently exceed what a passed assessment would show. |
| Role type binary | `role_type` is fresher/experienced only — it does not yet capture "experienced elsewhere, fresher in this new target career" (the Career Switcher gap noted in §3). Flagged for Phase 2, not solved today. |

---

## 9. Error States

| Scenario | Expected behavior |
|---|---|
| Empty state (no data yet) | An honest, specific empty message with a clear next action — never a fabricated example row. |
| Network failure | A retry-affordanced error banner; no silent failure, no infinite spinner. |
| Unauthorized access | Redirect to `/login` (or `/admin/unauthorized` for a non-admin hitting `/admin`); API routes return 401 JSON, never a raw stack trace. |
| Subscription expired | AI features degrade to "out of credits" messaging; every non-AI module is entirely unaffected by subscription status. |
| AI unavailable | Provider timeout/5xx is retried with backoff once, then surfaced as "AI is temporarily unavailable — try again shortly," never a raw provider error. |
| No jobs found | Explicit "no postings match your filters" with a one-click filter reset, not a silently broadened result set. |
| No learning progress | Dashboard's Continue Learning card shows a "Start your first course" prompt rather than an empty card. |

---

## 10. Notifications — *Proposed, not yet built*

No notification system exists in the product today. This is the
requirements for the system proposed in `docs/architecture/database-architecture.md`'s
Notifications domain.

| Notification | Trigger | Channel |
|---|---|---|
| Learning reminder | No lesson activity for N days, streak at risk | in-app, email |
| Interview reminder | An interview set started but not completed for 48h | in-app |
| Application update | `job_applications.status` changes | in-app, email |
| Subscription reminder | Plan renewal approaching, or credits nearly exhausted | in-app, email |
| AI credit alert | Credit balance crosses a low-balance threshold | in-app |

---

## 11. Future Roadmap

See `docs/roadmap/roadmap.md` (extracted here so it can be updated
independently).

---

## 12. Success Metrics

| KPI | Source |
|---|---|
| Daily Active Users | Distinct users with any lesson/practice/interview activity per day |
| Course Completion Rate | completed courses ÷ enrolled courses |
| Resume Generation Rate | Resumes created per active user |
| Interview Completion Rate | completed ÷ started interview attempts |
| Job Application Volume | Applications submitted per active user per week |
| AI Usage | Requests per feature per day, from `ai_requests` |
| Retention | D7 / D30 return rate post-signup |
| Conversion | Free → paid plan upgrade rate, once billing ships |

---

## 13. Risks

| Category | Risk | Mitigation |
|---|---|---|
| Technical | No Supabase CLI/migration runner wired up — every migration is applied by hand in order. | Strict numeric migration naming already enforced; adopt a CLI-based pipeline before team size grows. |
| Business | Onboarding drop-off before a user reaches any "aha" module. | Instrument funnel steps; shorten time-to-first-value (e.g. surface a quick win before the full wizard). |
| AI | Unmetered AI cost exposure until credits are actually enforced in a live feature; hallucinated resume/interview content presented as fact. | Credits/rate-limiting are already built — wire them in before any AI feature ships publicly; always label AI output as AI-generated. |
| Operational | First-admin bootstrap is a manual SQL insert with no audit trail. | Ship the proposed `admin_audit_log` before onboarding a second admin. |
| Legal & Privacy | Resume content and career data flow into AI provider calls as context. | `redactSensitiveFields()` already exists in the AI layer; extend its coverage and publish a data-retention policy before AI features go public. |

---

## 14. Release Strategy

- **MVP — current state** — Learning, Practice, Resume Studio, Mock
  Interview, Jobs all functional end-to-end; AI infra built, not
  user-facing.
- **Beta** — First 2-3 AI features wired into real UI (resume analysis,
  job match); credits/subscriptions enforced for real; invite-only or
  waitlisted rollout.
- **Public launch** — Notifications, RBAC, analytics rollups shipped;
  formal accessibility pass; open signup, marketing push.
- **Enterprise expansion** — Recruiter and College personas become real
  account types; multi-tenant-aware Admin RBAC.

---

ReSee Product Requirements Document — companion to
`docs/architecture/database-architecture.md` and
`docs/architecture/system-architecture.md`. Grounded in the platform as it
exists today; sections marked "Proposed" describe intended future work,
not shipped behavior.
