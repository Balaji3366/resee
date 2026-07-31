---
status: Accepted
last-reviewed: 2026-07-31
---

# Testing Standards

## Current state

No automated test suite exists in `website/package.json` — there is no
`test` script. The current CI gate (`.github/workflows/ci.yml`) runs
`npm run lint` and `npx tsc --noEmit` only. This is stated plainly rather
than implying a test suite exists.

## Verification practiced today, in lieu of automated tests

- `npx tsc --noEmit` and `npm run lint` after any change — both are safe
  to run without touching a live dev server's build cache.
- Manual curl verification of API routes against an already-running dev
  server (never a redundant second instance).
- For pure-logic modules with no user-facing surface (e.g. the AI
  service layer before it's wired to any route), a standalone `npx tsx`
  smoke script exercising the non-networked functions, written and
  deleted from a scratch directory rather than committed as a permanent
  fixture.

## Expected going forward

- Introduce a real test runner (Vitest, given the existing TypeScript/
  Next.js stack) once the codebase reaches a size where manual
  verification stops being reliable — recommended trigger: any module
  where a regression has already shipped undetected once.
- Prioritize integration tests over mocked unit tests for anything
  touching Supabase — a mocked-database test that passes while the real
  schema has drifted is worse than no test, per this project's own
  earlier incidents with mock/prod divergence in other contexts.
- E2E tests, if introduced, live inside `website/` next to the app they
  test (this is a single-package repo, not a monorepo) — not pulled out
  to a repo-root `e2e/` folder.
