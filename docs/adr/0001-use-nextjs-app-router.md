---
status: Accepted
date: retroactive
deciders: ReSee engineering
---

# ADR 0001: Use Next.js App Router over Pages Router

## Status

Accepted (retroactive — this decision predates formal ADR tracking)

## Context

Next.js 13+ offers two routing systems: the legacy Pages Router and the
newer App Router. ReSee needed server-rendered, auth-gated pages
(dashboard, learning, practice, resume, interviews, jobs, admin) alongside
API route handlers, with a shared layout/sidebar shell across most
authenticated routes.

## Decision

Build the entire application on the App Router (`app/`), using route
groups (`app/(dashboard)/`) for the shared authenticated shell, and
`app/api/**/route.ts` handlers for all API endpoints.

## Consequences

- Route groups give a shared sidebar/navbar layout to every dashboard
  page without duplicating layout code per route.
- Server Components and the `route.ts` handler convention are the
  primary way data reaches the client — no separate `pages/api/`
  directory to keep in sync.
- The App Router is actively developed by the Next.js team; some
  third-party libraries and examples still assume the Pages Router,
  requiring occasional adaptation.
- This project's own `AGENTS.md` explicitly warns this Next.js version
  has breaking changes from what most training data assumes — App Router
  conventions must be verified against the installed version's actual
  docs (`node_modules/next/dist/docs/`), not assumed from memory.

## Alternatives considered

- **Pages Router** — more third-party examples exist, but no built-in
  shared-layout-per-route-group primitive equivalent to route groups;
  would require a custom `_app`/`_layout` composition per section
  instead.
