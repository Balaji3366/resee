---
status: Accepted
date: retroactive
deciders: ReSee engineering
---

# ADR 0004: Use JSONB for single-owner flexible content instead of normalizing every field

## Status

Accepted (retroactive)

## Context

Several features need to store structured-but-flexible content owned by
exactly one row: resume content (personal info, education, experience,
projects, skills, certifications), quiz question options and correct
answers, and quiz/practice/interview attempt answer snapshots. Fully
normalizing each of these into child tables was an option for every one
of them.

## Decision

Use a `jsonb` column for content that is (a) owned by a single parent row
and (b) never queried into by another table or a WHERE clause on an
inner field. Normalize into a real child table whenever multiple rows
need to reference the same shape independently (e.g. `lessons`,
`interview_questions`, `mock_test_questions`).

## Consequences

- Resume content changes shape (add/remove/reorder sections) without a
  schema migration — the wizard-based Resume Studio redesign changed the
  entire content shape in a single migration touching only a `check`
  constraint and a default, not a multi-table restructure.
- Quiz/practice `options`/`correct_option_ids`/`answers` stay colocated
  with the question or attempt they belong to, matching how the
  application always reads and writes them together.
- Trade-off: nothing inside a JSONB column can be queried or indexed as
  efficiently as a real column — acceptable because nothing in this
  codebase filters or joins on a field inside these specific JSONB blobs.

## Alternatives considered

- **Normalize every field** — would require a `resume_education_items`,
  `resume_experience_items`, etc. table set with cross-table sort
  ordering, for content that only ever has one reader (the owning
  resume) and one writer (the owning user) — added complexity with no
  corresponding query benefit.
