---
status: Accepted
last-reviewed: 2026-07-31
---

# Coding Standards

Derived from conventions already applied consistently across
`website/**` — not aspirational rules.

## Naming

- **Files**: kebab-case for docs and repo-root tooling; `website/`
  follows Next.js's own casing (PascalCase component files, camelCase
  utility files) — unchanged by this document.
- **Components**: PascalCase (`ResumeCard.tsx`, `InterviewSessionRunner.tsx`).
- **Hooks**: `use` + PascalCase noun (`useResumes.ts`, `useJobPreferences.ts`).
- **API routes**: nested under `app/api/<domain>/**`, one `route.ts` per
  resource/action (`app/api/jobs/[jobSlug]/route.ts`,
  `app/api/resumes/[id]/versions/[versionId]/restore/route.ts`).
- **Booleans**: read as a predicate (`is_available`, `quiz_passed`,
  `onboarding_completed`), never `flag` or `status1`.

## Hook shape

Every data-fetching hook returns `{ data, loading, error[, refetch] }`,
built with `useCallback` + `useEffect`. The bootstrap effect's first
`setState` call carries `// eslint-disable-next-line
react-hooks/set-state-in-effect` — only the first call in an effect
needs it; additional ones become an unused-directive lint warning.

## Component reuse across module boundaries

Established precedent: reach for an existing shared component before
writing a new one for the same shape. Examples already in place:
`components/onboarding/{SelectableCard,StepFooter,TagInput}.tsx`,
`components/practice/{PracticeStatTile,BookmarkButton}.tsx`,
`components/interviews/PickerChipGrid.tsx`. `PickerChipGrid` is
single-select only — building a multi-select equivalent (see
`components/jobs/MultiSelectChips.tsx`) rather than retrofitting it is
the correct call when the shape genuinely differs.

## Design tokens

Tailwind CSS v4 tokens defined in `@theme` (no config file). Two
easy-to-get-wrong tokens: `--color-amber` renders **blue** despite the
name (use the literal class names, never substitute `sky-*`/`blue-*`
utilities); `--color-panel-2` is a dark navy meant only for small
badges/hover accents — never a large card background or text sitting
directly on it without checking contrast (this exact
dark-text-on-dark-background bug has recurred multiple times in this
codebase's history).

## "Honest MVP" principle

Never fabricate data. Real content plus honest "Coming Soon" / empty
states for gaps. Extends to never leaving a misleading placeholder
number (e.g. a stubbed metric should read `not_started`, not a fake `0`
that looks computed).

## Error handling

Don't add error handling, fallbacks, or validation for scenarios that
can't happen. Validate at system boundaries (user input, external APIs).
Trust internal code and framework guarantees.
