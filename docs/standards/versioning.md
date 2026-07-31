---
status: Accepted
last-reviewed: 2026-07-31
---

# Versioning Strategy

## Scheme

[Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`.

- **MAJOR** — breaking changes to a public contract (API response shape,
  database schema requiring manual migration by consumers).
- **MINOR** — new functionality, backward compatible.
- **PATCH** — bug fixes, no functional change.

## Pre-1.0 rule

The project is currently pre-1.0 (`website/package.json` version
`0.1.0`). Per SemVer's own 0.x convention, breaking changes bump MINOR,
not MAJOR, until 1.0.0 is declared. Declaring 1.0.0 is itself a product
decision (see `docs/product/prd.md` §14 Release Strategy — likely at
Public Launch), not an automatic milestone.

## Tags and releases

- A git tag is only created alongside a release note
  (`templates/release-notes.md`) — never tag without one.
- Tag format: `v<MAJOR>.<MINOR>.<PATCH>`, matching
  `website/package.json`'s `version` field exactly.
