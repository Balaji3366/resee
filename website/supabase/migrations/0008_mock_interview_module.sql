-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- Run this SQL manually in the Supabase Dashboard SQL editor, then run
-- 0008b_mock_interview_module_seed.sql. Wholly new tables — unrelated to
-- the existing app/api/interview/route.ts (a separate, pre-existing
-- one-shot Gemini "generate questions from a PDF" tool used only by the
-- Documents page), left completely untouched. Written with `if not
-- exists` for idempotency.

-- ============================================================
-- Catalog tables (public-read)
-- ============================================================

create table if not exists public.interview_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null,
  description text not null,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- A role is never itself "unavailable" — availability is entirely a
-- property of whether a matching interview_sets row exists for a given
-- category+role+difficulty, so no is_available column here.
create table if not exists public.interview_roles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- The bookable content unit (category x role x difficulty), direct
-- analog of practice_topics.
create table if not exists public.interview_sets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references public.interview_categories(id) not null,
  role_id uuid references public.interview_roles(id) not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  title text not null,
  description text not null,
  is_available boolean not null default false,
  estimated_minutes int not null default 20,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, role_id, difficulty)
);

-- interview_questions holds no secret/correct-answer data (open-ended
-- prompts only) so public read is safe here, unlike practice_questions.
-- IMPORTANT: this table's RLS is `using (true)` — public by DEFAULT.
-- Any future AI-grading rubric/ideal-answer data must live in a NEW,
-- separately-RLS'd table (zero select policies, service-role-only),
-- never as a column added to this table.
create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_set_id uuid references public.interview_sets(id) on delete cascade not null,
  question text not null,
  question_type text not null check (question_type in ('short_text', 'long_text')), -- future: 'voice', 'video'
  sort_order int not null
);

-- ============================================================
-- User attempts (mutable in-progress row, mirrors practice_attempts)
-- ============================================================

create table if not exists public.interview_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  interview_set_id uuid references public.interview_sets(id) on delete cascade not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  question_ids jsonb not null,
  answers jsonb not null default '{}',
  total_questions int not null,
  completed_questions int,
  time_taken_seconds int,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists interview_attempts_one_in_progress_per_set
  on public.interview_attempts (user_id, interview_set_id) where (status = 'in_progress');

-- ============================================================
-- RLS
-- ============================================================

alter table public.interview_categories enable row level security;
alter table public.interview_roles enable row level security;
alter table public.interview_sets enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_attempts enable row level security;

create policy "interview_categories_public_read" on public.interview_categories for select using (true);
create policy "interview_roles_public_read" on public.interview_roles for select using (true);
create policy "interview_sets_public_read" on public.interview_sets for select using (true);
create policy "interview_questions_public_read" on public.interview_questions for select using (true);

create policy "interview_attempts_select_own" on public.interview_attempts for select using (auth.uid() = user_id);
create policy "interview_attempts_insert_own" on public.interview_attempts for insert with check (auth.uid() = user_id);
create policy "interview_attempts_update_own" on public.interview_attempts for update using (auth.uid() = user_id);
-- Delete IS allowed here (unlike practice_attempts/mock_test_attempts) —
-- "Delete Interview History" is an explicit product requirement for
-- this module.
create policy "interview_attempts_delete_own" on public.interview_attempts for delete using (auth.uid() = user_id);

create index if not exists interview_sets_category_role_idx on public.interview_sets (category_id, role_id);
create index if not exists interview_questions_set_idx on public.interview_questions (interview_set_id, sort_order);
create index if not exists interview_attempts_user_set_idx on public.interview_attempts (user_id, interview_set_id);
create index if not exists interview_attempts_user_status_idx on public.interview_attempts (user_id, status);
