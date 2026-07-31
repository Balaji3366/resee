# Architecture Decision Records

One immutable file per significant decision, numbered sequentially, never
renumbered or deleted — superseding a decision means writing a new ADR
that references the old one, not editing history.

## When to write one

- The decision is hard or costly to reverse (choice of database, hosting
  platform, auth provider, core data-modeling pattern).
- Two or more reasonable options existed and a real tradeoff was made —
  not a decision with only one sane answer.
- A future engineer would reasonably ask "why didn't we just use X
  instead?"
- **Not** for routine implementation choices (variable names, which hook
  wraps which endpoint) — those belong in code review, not an ADR.

## Format

Copy `templates/decision-record.md`: Status, Context, Decision,
Consequences, Alternatives Considered.

## Index

| ADR | Decision | Status |
|---|---|---|
| [0001](./0001-use-nextjs-app-router.md) | Use Next.js App Router over Pages Router | Accepted |
| [0002](./0002-use-supabase-as-backend.md) | Use Supabase (Postgres + Auth + RLS) as the sole backend | Accepted |
| [0003](./0003-postgres-backed-ai-orchestrator.md) | AI orchestrator's rate limiting and caching are Postgres-backed, not Redis | Accepted |
| [0004](./0004-jsonb-for-flexible-content.md) | Use JSONB for single-owner flexible content instead of normalizing every field | Accepted |
| [0005](./0005-rls-three-pattern-access-model.md) | Three-pattern RLS model as the only access patterns | Accepted |

These five are retroactive — decisions already live in the codebase,
recorded now so the reasoning isn't lost or re-litigated.
