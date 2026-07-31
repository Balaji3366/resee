---
status: Accepted
last-reviewed: 2026-07-31
---

# Practice & Assessment Module

## Purpose

Topic-based question drilling and timed mock tests to validate readiness
— the rehearsal layer between Learning content and the real interview/job
application.

## Structure

`practice_categories → practice_topics → practice_questions`, plus
`mock_tests → mock_test_questions` reusing the same question bank (no
duplicated question content between the two).

- **practice_questions** support single-choice, multi-select, and
  true/false — zero select policy, same answer-protection pattern as
  `quiz_questions`.
- **practice_attempts** and **mock_test_attempts** are mutable
  in-progress rows: created at session start (snapshotting an ordered
  `question_ids` array), autosaved via `answers` jsonb, updated to
  `completed` on submit.

## User flow

1. Pick a topic (or a full mock test).
2. Start an attempt — snapshots the question order.
3. Answer questions; answers autosave.
4. Submit — attempt marked `completed`, score computed.
5. Optionally bookmark a question or report it.

## Business rules

- Exactly **one in-progress attempt per topic/test at a time**
  (`practice_attempts_one_in_progress_per_topic` partial unique index) —
  this is what powers "Continue Practice" across a refresh or device
  change.
- Answer keys never reach the client under any circumstance.
- Bookmarks are the one table in this domain with a real delete policy
  (toggle-off); attempts and reports are otherwise insert/select only.

## Edge cases

- An attempt abandoned mid-session is resumable exactly where it was
  left, including prior answers.
- A reported question (`practice_question_reports`) has no formal admin
  review workflow yet — it's an honest append-only log, not a ticketing
  system.

## Dependencies

- Progress module (skill linkage via `practice_topics.skill_id`, weak/
  strong topic surfacing, career score's `technical_skills` sub-metric —
  currently stubbed).
