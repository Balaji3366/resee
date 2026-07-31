---
status: Accepted
last-reviewed: 2026-07-31
---

# Resume Studio

## Purpose

Generate a polished, role-appropriate resume without a blank-page
problem — a guided wizard, not a rich free-form editor.

## Structure

A single `resumes` row per resume: `template_slug` (check-constrained to
`modern`/`ats-friendly`, no catalog table — template selection is app
logic, not user choice), and a `content jsonb` document with a fixed
shape: `personalInfo`, `education[]`, `experience[]`, `projects[]`,
`skills[]`, `certifications[]`. `resume_versions` holds a full-content
snapshot per throttled save, restorable.

## User flow

1. 7-step wizard: userType → personal info → education → experience →
   projects → skills → certifications → generate.
2. Template auto-selected from `userType` (ATS-friendly for fresher,
   Modern for experienced) via `lib/resumeTemplateSelection.ts` — never a
   manual gallery pick.
3. Preview → Download PDF (client-side, `jspdf`) or Edit Information.
4. Version History → Restore a prior snapshot if needed.

## Business rules

- `template_slug` and `title` (derived from
  `content.personalInfo.fullName`) are **re-derived on every save**, not
  stored as independent user choices — editing `role_type` after a
  resume already exists silently changes its template on next save.
- A version snapshot is taken on throttled save (not every keystroke).
  Restoring a version re-derives the template from *that version's*
  `userType`, never keeps a stale template mismatched to the restored
  content.
- No archive/status concept exists — the earlier template-gallery +
  archive-status design was intentionally removed in the wizard-based
  redesign in favor of one resume, cleanly versioned.

## Edge cases

- A user with no resume yet sees an honest "Start your resume" prompt,
  never a fabricated example.

## Dependencies

- `profiles.role_type` (template selection input).
- PDF export library (`jspdf`), client-side only today — see
  `docs/architecture/system-architecture.md`'s Background Processing
  section for when server-side/queued generation would become relevant.
