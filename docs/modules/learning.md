---
status: Accepted
last-reviewed: 2026-07-31
---

# Learning Module

## Purpose

Structured, sequential skill-building content — the foundation-building
half of the platform, primarily for Freshers, Students, and Career
Switchers (see `docs/product/prd.md` §2).

## Structure

`learning_categories → courses → course_modules → lessons / quizzes`

- A **course** belongs to a category, has a difficulty
  (beginner/intermediate/advanced), and an `is_available` gate for
  Coming Soon content. The Admin CMS additionally tracks a
  `status` (draft/published/archived) — only `published` courses ever
  reach the public catalog, regardless of `is_available`.
- A **course_module** is an ordered unit within a course
  (`unique(course_id, sort_order)`).
- A module contains **lessons** (content, key takeaways, estimated
  minutes) and optionally one **quiz**.
- A **quiz** has **quiz_questions** — single-choice or multi-select,
  with `correct_option_ids` that never reach the browser (zero select
  policy, service-role read only).

## User flow

1. Browse the catalog (grouped by category, difficulty labeled).
2. Enroll in a course (`enrollments`, one row per user per course).
3. Complete lessons in order (`lesson_progress`, insert-only completion
   log).
4. Attempt the module's quiz (`quiz_attempts`, insert-only per submit).
5. Module marked complete once its completion rule (below) is met.

## Business rules

- **Module completion** = quiz passed at 100%, **or** lesson-completion
  ratio capped at 60% without a passed quiz. Visible progress can never
  silently exceed what an actual passed assessment would show.
- Streaks (`profiles.current_streak`/`longest_streak`/
  `last_activity_date`) and `total_learning_minutes` are shared platform
  concepts, not Learning-specific — Practice activity also feeds them.
- A course can optionally link to a `skills` catalog entry via
  `course_modules.skill_id`, feeding the Progress module's skill radar.
  Mixed-content modules are left unlinked rather than mislabeled to a
  single skill.

## Edge cases

- A course marked unavailable mid-enrollment shows "Coming Soon," never a
  broken link.
- Retaking an already-passed quiz is allowed; it does not lower a
  previously-achieved `quiz_best_score`.

## Dependencies

- Progress module (skill linkage, streak, career score's
  `learning_progress` sub-metric — currently stubbed, see
  `docs/product/prd.md` §4 AI/Progress).
