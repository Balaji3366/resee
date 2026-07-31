---
status: Accepted
last-reviewed: 2026-07-31
---

# Branch Strategy

## Naming

`type/short-description`, kebab-case description:

- `feat/jobs-recommendation-engine`
- `fix/interview-timer-contrast`
- `docs/adr-0006`
- `chore/dependabot-config`
- `refactor/resume-service-extraction`

## Flow

- `main` is always deployable.
- Feature branches are cut from `main`, merged back via PR (see
  `.github/PULL_REQUEST_TEMPLATE.md`), never committed to directly.
- No long-lived environment branches (`develop`, `staging`) exist today —
  a single-branch-plus-feature-branches flow matches the current team
  size; introduce environment branches only if a real need (a staging
  environment requiring independent deploy timing) arises.

## Pushing

Local commits are not pushed to `origin` automatically — pushing is
always an explicit, separately-confirmed action, never bundled silently
into a commit step.
