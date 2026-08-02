-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before this feature
-- works. Written with if-not-exists guards for idempotency.
--
-- AI Phase 0 (platform foundation) additions:
--   1. ai_requests gets a redacted-params column so admin observability
--      (Request Logs) has real request context, not just metadata —
--      lib/ai/requestManager.ts now always redacts via
--      redactSensitiveFields() before writing here.
--   2. feature_flags makes the 9 AI feature flags DB-backed and
--      admin-toggleable at runtime instead of a static code constant
--      requiring a deploy to flip — the exact seam
--      components/providers/FeatureFlagsProvider.tsx was built to leave
--      open ("without building that infrastructure now"). This IS that
--      infrastructure now. lib/config/featureFlags.config.ts remains the
--      source of truth for which flag KEYS exist and their fallback
--      default; this table overrides the boolean VALUE, same
--      "DB overrides descriptive config" pattern already used for
--      subscription_plans vs. lib/config/subscription.config.ts.

alter table public.ai_requests
  add column if not exists params_redacted jsonb;

create table if not exists public.feature_flags (
  slug text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (slug, enabled, description) values
  ('aiResumeAnalysis', false, 'AI resume ATS analysis, wired to a saved Resume Studio resume'),
  ('aiResumeRewrite', false, 'AI resume rewrite/improvement'),
  ('aiJobMatch', false, 'AI job-match scoring on job postings'),
  ('aiInterviewEvaluation', false, 'AI feedback on mock interview answers'),
  ('aiCareerRoadmap', false, 'AI-generated milestone roadmap toward a target role'),
  ('aiSkillGap', false, 'AI skill-gap analysis against a target role'),
  ('aiCareerCoaching', false, 'AI career coaching (single-turn, context-grounded)'),
  ('aiLearningRecommendation', false, 'AI learning recommendations (prompt builder not yet built)'),
  ('aiDailyRecommendation', false, 'AI daily practice/learning nudge (prompt builder not yet built)')
on conflict (slug) do nothing;

alter table public.feature_flags enable row level security;

-- Public read — the client-side FeatureFlagsProvider needs to know
-- which features are live; flags carry no sensitive data, only on/off
-- state and a description. Writes are service-role only via the new
-- admin API route (mirrors admin_users' write model).
-- create policy has no IF NOT EXISTS in Postgres — drop-then-create
-- keeps this file safely re-runnable if it's ever run again.
drop policy if exists "feature_flags_public_read" on public.feature_flags;
create policy "feature_flags_public_read" on public.feature_flags for select using (true);
