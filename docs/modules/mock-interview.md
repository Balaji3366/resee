---
status: Accepted
last-reviewed: 2026-07-31
---

# Mock Interview Module

## Purpose

Realistic, role- and experience-level-specific interview rehearsal before
the real thing.

## Structure

`interview_categories` (HR / Technical / Behavioural) × `interview_roles`
(9 roles) × `experience_level` (fresher / 1-3-years / 3-5-years /
5-plus-years) define an **interview_sets** row — the bookable content
unit. Each set has open-ended `interview_questions`
(`short_text`/`long_text`, with a schema comment already reserving
`voice`/`video` for a future phase).

## User flow

1. Minimal landing page → 3-step wizard: select career, select
   experience, choose interview type.
2. Session runner: timed, open-ended question-by-question answers.
3. Completion screen: questions answered, total time — **no AI-graded
   feedback**, by explicit design (open-ended answers have no single
   correct answer to grade against yet).
4. Interview History: list of completed attempts, with delete.

## Business rules

- **A role is never itself "unavailable"** — availability is entirely a
  property of whether a matching `interview_sets` row exists for a given
  category×role×experience-level combination. Picking a combination with
  no authored set shows an honest "not available yet."
- Exactly one in-progress attempt per set at a time.
- `interview_attempts` is the **only** attempt-tracking table across the
  entire platform with a real delete policy — "Delete Interview History"
  is an explicit product requirement, distinct from Practice's
  no-delete-on-attempts convention.
- `interview_questions` is public-read (no answer key exists to
  protect) — any future AI-grading rubric/ideal-answer data must live in
  a new, separately-RLS'd table, never a column added here.

## Edge cases

- Timer badge contrast: a prior bug (`bg-panel-2 text-bone`, two
  near-identical dark colors) made the timer unreadable — fixed to
  `text-white`. The identical bug pattern exists elsewhere in
  `components/practice/PracticeQuestionRunner.tsx` and remains
  intentionally unfixed pending explicit direction.

## Dependencies

- Interview role vocabulary is reused by the Jobs module
  (`jobs.role_slug` alignment, not a hard FK) and by
  `components/interviews/PickerChipGrid.tsx`/`useInterviewRoles()`,
  reused again in Jobs' `MultiSelectChips`.
