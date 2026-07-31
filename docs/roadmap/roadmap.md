---
status: Accepted
source: Extracted from docs/product/prd.md §11 (Future Roadmap)
---

# ReSee — Future Roadmap

## Phase 1 — shipped

**Foundation**

- Auth, onboarding, Dashboard
- Learning, Practice, Resume Studio, Mock Interview, Jobs
- AI backend infrastructure (orchestrator, credits, logging) — built, not wired to UI
- Admin CMS, basic RBAC

## Phase 2 — next

**Connect the intelligence**

- Wire the 9 AI capabilities into real UI entry points (resume analysis,
  job match, interview evaluation, skill gap, roadmap, coaching)
- Notifications system
- Admin RBAC normalization + audit log
- Analytics rollups (daily activity snapshots)
- Career Switcher profile gap resolved (`role_type` doesn't yet capture
  "experienced elsewhere, fresher in this new field" — see
  `docs/product/prd.md` §8)

## Phase 3 — scale

**Enterprise readiness**

- Background workers + event-driven architecture
- Companies as a first-class entity
- Formal accessibility audit
- Structured observability (error tracking, API/AI metrics dashboards)

## Future vision

**Beyond the current model**

- Recruiter accounts — post roles, browse ReSee-verified candidates
- College/institutional accounts — cohort-wide placement tracking
- Voice/video mock interviews (schema seam already reserved —
  `interview_questions.question_type` carries a `-- future: 'voice', 'video'`
  comment today)
- Certifications and portfolio verification
