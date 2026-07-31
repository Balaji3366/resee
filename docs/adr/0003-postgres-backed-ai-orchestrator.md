---
status: Accepted
date: retroactive
deciders: ReSee engineering
---

# ADR 0003: AI orchestrator's rate limiting and caching are Postgres-backed, not Redis

## Status

Accepted (retroactive)

## Context

The AI Architecture (`website/lib/ai/**`) needed both a rate limiter
(technical abuse prevention, independent of the business-level credit
limit) and a response cache (avoid redundant provider calls for identical
requests). The conventional choice for both is an in-memory store like
Redis.

## Decision

Implement both on top of Postgres tables already in the schema:
`checkRateLimit()` counts recent rows in `ai_requests` within a sliding
window; `getCachedResponse()`/`setCachedResponse()` read/write
`ai_response_cache`, a TTL-expiring table with zero RLS select policy. No
Redis or other in-memory store was introduced.

## Consequences

- No new piece of infrastructure to provision, monitor, or pay for at
  current scale.
- Rate-limit and cache reads add Postgres query load instead of
  sub-millisecond in-memory lookups — acceptable given AI request volume
  is currently zero (nothing in the running app calls the orchestrator
  yet).
- If AI request volume grows enough that a per-request Postgres count
  query becomes the bottleneck, this decision should be revisited — see
  `docs/architecture/system-architecture.md`'s Scalability section, which
  explicitly flags this as a 1M+-user-tier reconsideration point, not a
  permanent constraint.

## Alternatives considered

- **Redis (e.g. Upstash)** — faster reads/writes, but a second
  infrastructure dependency with no other use case in this codebase yet;
  deferred until a measured bottleneck justifies it, per this project's
  "Postgres-first, add infra only when proven necessary" principle.
