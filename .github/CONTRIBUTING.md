# Contributing to ReSee

## Local setup

The application lives entirely under `website/`:

```
cd website
npm install
npm run dev
```

See `website/README.md` for framework-specific notes.

## Before you start

1. Read `docs/standards/coding-standards.md` and `docs/standards/api-standards.md`.
2. Check `docs/architecture/` if your change touches the database or a cross-cutting system (AI, background jobs).
3. For a structural or hard-to-reverse decision, check `docs/adr/` for an existing record before re-deciding something already settled.

## Branching and commits

- Branch naming and commit message conventions: `docs/standards/branch-strategy.md` and `docs/standards/commit-convention.md`.
- One logical change per PR. Unrelated fixes belong in separate PRs.

## Opening a PR

- Use the PR template — it isn't optional boilerplate, the checklist reflects real gates (lint, typecheck, migration docs).
- Link the issue it closes.
- If your change affects the database schema, update `docs/architecture/database-architecture.md` in the same PR.

## Documentation changes

- Docs live in `docs/`, organized by audience (see `docs/README.md`).
- A new ADR is warranted for any hard-to-reverse structural decision — see `docs/adr/README.md` for the criteria.

## Code of Conduct

By participating in this project you agree to abide by `.github/CODE_OF_CONDUCT.md`.
