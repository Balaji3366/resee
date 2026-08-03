-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project. Written with
-- if-not-exists guards and drop-then-create policies for full
-- idempotency — safe to run even if a prior attempt partially succeeded.
--
-- AI Phase 3 (Interview Intelligence). Mirrors the exact
-- resume_analyses pattern from 0020_resume_intelligence.sql field-for-
-- field, rather than inventing a new schema shape: ai_requests
-- (metadata/tokens/status) and ai_response_cache (short-TTL cache)
-- already exist and are reused unchanged for the AI call itself; this
-- table is the permanent, user-browsable history of each evaluation/
-- deep-analysis result tied to the specific interview attempt it ran
-- against.
--
-- interview_attempts/interview_questions/interview_sets are untouched —
-- per 0008/0010's own explicit reservation ("any future AI-grading data
-- must live in a NEW, separately-RLS'd table... never a column added to
-- interview_questions"), this migration honors that directive rather
-- than bolting a score column onto an existing public-read table.
--
-- question_id is nullable: null for the automatic whole-session
-- Post-Session Evaluation, populated for a per-question Deep AI
-- Analysis row.

create table if not exists public.interview_analyses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.interview_attempts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references public.interview_questions(id) on delete cascade,
  feature text not null check (feature in ('interview_evaluation', 'interview_deep_analysis')),
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.interview_analyses enable row level security;

drop policy if exists "interview_analyses_select_own" on public.interview_analyses;
create policy "interview_analyses_select_own" on public.interview_analyses for select using (auth.uid() = user_id);

drop policy if exists "interview_analyses_insert_own" on public.interview_analyses;
create policy "interview_analyses_insert_own" on public.interview_analyses for insert with check (auth.uid() = user_id);

drop policy if exists "interview_analyses_delete_own" on public.interview_analyses;
create policy "interview_analyses_delete_own" on public.interview_analyses for delete using (auth.uid() = user_id);

create index if not exists interview_analyses_attempt_created_idx
  on public.interview_analyses (attempt_id, created_at desc);
create index if not exists interview_analyses_user_created_idx
  on public.interview_analyses (user_id, created_at desc);
