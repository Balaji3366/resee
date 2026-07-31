---
status: Accepted
last-reviewed: 2026-07-31
---

# Engineering Standards — Overview

This is the umbrella index for ReSee's engineering standards. Each
standard has its own file with full detail; this page states the
one-line rule and points to it.

| Standard | One-line rule | Detail |
|---|---|---|
| Coding | kebab-case files outside `website/`'s own Next.js conventions, PascalCase components, camelCase functions/hooks | `coding-standards.md` |
| API | every route: `getServerSupabase()` → `auth.getUser()` → 401 JSON → `export const dynamic = "force-dynamic"` | `api-standards.md` |
| Testing | no automated suite exists yet; `npm run lint` + `npx tsc --noEmit` are the current CI gate | `testing-standards.md` |
| Branching | `type/short-description`, e.g. `feat/jobs-recommendation-engine` | `branch-strategy.md` |
| Commits | `type: summary`, imperative mood, why over what | `commit-convention.md` |
| Versioning | Semantic Versioning; pre-1.0, breaking changes bump MINOR not MAJOR | `versioning.md` |

## Why this exists as its own file

"Engineering Standards" was named as a single deliverable in this
project's documentation plan. Rather than force six genuinely distinct
concerns (naming vs. API shape vs. branching vs. versioning) into one
long file, each is its own document — this page is the single-page
summary that deliverable implies, linking out to the real detail.
