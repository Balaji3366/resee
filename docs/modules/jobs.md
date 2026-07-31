---
status: Accepted
last-reviewed: 2026-07-31
---

# Jobs & Career Hub

## Purpose

Browse, save, and track applications to real postings — the module a
Fresher, Experienced Professional, or Career Switcher reaches once their
resume and interview readiness are in place.

## Structure

`jobs` (public-read catalog — every seeded posting is equally real and
browsable, unlike Practice/Interview's Coming Soon tier) plus three
user-owned tables: `saved_jobs`, `job_applications`, `job_preferences`.

- `jobs.role_slug` aligns to `interview_roles.slug` vocabulary where
  possible, but is **not** a hard FK — postings for roles outside that
  9-role list aren't blocked.
- `experience_level` uses the same 4-bucket taxonomy as
  `interview_sets`, for cross-module consistency; continuous
  `experience_min_years`/`experience_max_years` and
  `salary_min`/`salary_max` (LPA) are kept alongside the bucket rather
  than discarded.

## User flow

1. Browse/search/filter the catalog.
2. Save a job for later (`saved_jobs`), or apply
   (`job_applications`, status defaults to `applied`).
3. Track applications on a 5-status Kanban board (`applied` →
   `interview_scheduled` → `offer_received`/`rejected` → `archived`), or
   a flat history list.
4. Set preferences (`job_preferences`: preferred roles, locations, work
   mode) to power "Recommended Jobs."

## Business rules

- **One application per user per job, ever** — unique
  `(user_id, job_id)`, and `archived` is an explicit terminal status,
  making delete redundant by design (not copied from another table's
  precedent — the earlier "no-delete precedent" reasoning was corrected
  during design review to stand on this table's own merits).
- No delete policy on `job_applications` — accepted limitation: a user
  who reaches `archived` can't re-track a fresh application to the same
  job later (e.g. reapplying after 6 months). Acceptable for the current
  scope.
- "Recommended Jobs" uses a fallback chain: `job_preferences` →
  `profiles.target_career` (ILIKE match) → recent postings — not
  preferences alone, since fuzzy `target_career` text (e.g. "Government
  Jobs") won't match every seeded role slug.

## Edge cases

- Zero postings matching a filter combination shows an explicit empty
  state with a one-click filter reset, never a silently broadened
  search.

## Dependencies

- `interview_roles` vocabulary (role_slug alignment,
  `MultiSelectChips`/`useInterviewRoles()` reuse for preferred-roles
  input — built new rather than retrofitting the single-select
  `PickerChipGrid`, since job-search filters genuinely need multi-select).
