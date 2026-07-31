---
status: Accepted
date: retroactive
deciders: ReSee engineering
---

# ADR 0005: Three-pattern RLS model as the only access patterns

## Status

Accepted (retroactive)

## Context

With Postgres RLS as the enforcement layer for every table (see ADR
0002), each new table needs a decision about who can read and write it.
Left undecided per-table, this risks each new domain inventing a slightly
different access shape.

## Decision

Every table's RLS falls into exactly one of three patterns:

1. **Public-read catalog** — `for select using (true)`, writes only via
   seed migrations or the service-role client (courses, practice_topics,
   interview_sets, jobs, subscription_plans, …).
2. **Own-row CRUD** — `using (auth.uid() = user_id)` on whichever of
   select/insert/update/delete the product actually needs, never all four
   by default (resumes, practice_attempts, saved_jobs, …).
3. **Zero-policy, service-role only** — RLS enabled with no policies at
   all; the anon/browser key can never read these rows under any
   condition (quiz_questions, practice_questions, ai_response_cache).

No table invents a fourth pattern.

## Consequences

- Any engineer reading a new table's RLS policies immediately recognizes
  which of the three patterns it follows, without re-deriving the access
  model from scratch.
- Deliberate per-table variance is visible and intentional (e.g.
  `interview_attempts` has a real delete policy while
  `practice_attempts`/`mock_test_attempts` don't) — flagged in the
  Database Architecture doc as a product requirement, not an
  inconsistency.
- New domains (Notifications, the proposed Admin RBAC tables) are
  designed to fit one of these three patterns rather than inventing a
  new one.

## Alternatives considered

- **Per-table bespoke policies with no shared taxonomy** — more
  "flexible" in theory, but the actual result across nine already-shipped
  domains would be nine slightly different security models to audit
  individually instead of three to verify once.
