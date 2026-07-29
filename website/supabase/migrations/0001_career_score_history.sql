-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before the
-- /api/career-score route will work.

create table if not exists public.career_score_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  resume_quality integer check (resume_quality between 0 and 100),
  technical_skills integer check (technical_skills between 0 and 100),
  interview_readiness integer check (interview_readiness between 0 and 100),
  learning_progress integer check (learning_progress between 0 and 100),
  project_portfolio integer check (project_portfolio between 0 and 100),
  job_readiness integer check (job_readiness between 0 and 100),
  source text not null default 'computed', -- 'onboarding_baseline' | 'computed'
  created_at timestamptz not null default now()
);

create index if not exists career_score_history_user_created_idx
  on public.career_score_history (user_id, created_at desc);

alter table public.career_score_history enable row level security;

create policy "career_score_history_select_own"
  on public.career_score_history for select
  using (auth.uid() = user_id);

create policy "career_score_history_insert_own"
  on public.career_score_history for insert
  with check (auth.uid() = user_id);
