---
status: Accepted
last-reviewed: 2026-07-31
---

# Commit Message Convention

## Format

```
type: short imperative summary

Optional body explaining WHY, not what — the diff already shows what.
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`.

## Examples from this project's own history

- `feat: add Mock Interview Platform`
- `feat: add Resume Builder & Resume Management System`
- `fix: resolve invisible timer badge contrast in interview session runner`
- `docs: initialize enterprise documentation structure`

## Rules

- Imperative mood ("add", "fix", not "added"/"fixes").
- One logical change per commit where practical — when multiple unrelated
  features accumulate uncommitted in the same working tree, split them
  into separate commits by explicit file list (`git add <files>`, never
  `git add -A`), isolating any file that genuinely mixes two unrelated
  changes into its own small commit rather than misattributing it to
  either.
- Never commit with `--no-verify` to skip hooks unless explicitly
  instructed to.
