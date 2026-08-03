-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project. Written with
-- if-not-exists guards and drop-then-create policies for full
-- idempotency — safe to run even if a prior attempt partially succeeded.
--
-- AI Phase 1 (Resume Intelligence). This is the only new table this
-- phase needs: `ai_requests` (metadata/tokens/status) and
-- `ai_response_cache` (short-TTL response cache) already exist and are
-- reused unchanged for every Resume Intelligence AI call — this table
-- is a genuinely separate concern: a permanent, user-browsable history
-- of each analysis/rewrite/comparison result, tied to the specific
-- resume it was run against, which neither existing table provides
-- (ai_requests never stores the actual structured result; ai_response_cache
-- self-expires in minutes-to-hours and isn't queryable per-resume).
--
-- resumes/resume_versions/resume_templates are untouched — Resume Studio
-- itself is not modified by this migration.

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  feature text not null check (
    feature in ('resume_analysis', 'resume_rewrite', 'resume_bullet_improvement', 'resume_version_comparison')
  ),
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.resume_analyses enable row level security;

drop policy if exists "resume_analyses_select_own" on public.resume_analyses;
create policy "resume_analyses_select_own" on public.resume_analyses for select using (auth.uid() = user_id);

drop policy if exists "resume_analyses_insert_own" on public.resume_analyses;
create policy "resume_analyses_insert_own" on public.resume_analyses for insert with check (auth.uid() = user_id);

drop policy if exists "resume_analyses_delete_own" on public.resume_analyses;
create policy "resume_analyses_delete_own" on public.resume_analyses for delete using (auth.uid() = user_id);

create index if not exists resume_analyses_resume_created_idx
  on public.resume_analyses (resume_id, created_at desc);
create index if not exists resume_analyses_user_created_idx
  on public.resume_analyses (user_id, created_at desc);

-- No new feature_flags rows: resume_bullet_improvement rides under the
-- existing aiResumeRewrite flag and resume_version_comparison rides
-- under the existing aiResumeAnalysis flag (see the API routes for
-- exactly which flag each new endpoint checks) — both flags already
-- exist from supabase/migrations/0018_ai_pipeline_hardening.sql.
