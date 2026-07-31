---
status: Accepted
date: retroactive
deciders: ReSee engineering
---

# ADR 0002: Use Supabase (Postgres + Auth + RLS) as the sole backend

## Status

Accepted (retroactive)

## Context

ReSee needed a database, an authentication system, and a way to enforce
per-user data access — without standing up and operating a separate API
server, a separate auth provider, and a separate authorization layer as
three independent pieces of infrastructure.

## Decision

Use Supabase as the single backend: Postgres for all data (across all ten
product domains), Supabase Auth (JWT-based, cookie-stored via
`@supabase/ssr`) for identity, and Postgres Row Level Security for
per-user data access — enforced at the database layer, not only in
application code.

## Consequences

- Every table's access rules live in the database itself (RLS policies),
  not scattered across route handlers — see
  `docs/architecture/database-architecture.md`'s three-pattern model.
- No separate API server to deploy, scale, or keep in sync with the
  database schema.
- The `getServerSupabase()` (RLS-respecting) vs. `supabaseAdmin`
  (service-role, bypasses RLS) split became this project's core security
  primitive — every route explicitly chooses which one it needs.
- Trade-off: business logic that spans multiple tables in a single
  transaction is written in application code calling Postgres, not in
  stored procedures — acceptable at current scale, revisit if
  cross-table transactional integrity becomes a real pain point.

## Alternatives considered

- **A separate Node/Express API + a standalone Postgres instance +
  Auth0/Clerk** — three services to operate and keep in sync instead of
  one integrated platform, with authorization logic living only in
  application code (no RLS equivalent) rather than enforced at the data
  layer.
