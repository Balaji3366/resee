-- NOTE: Run manually in the Supabase Dashboard SQL editor, then run
-- 0010b_mock_interview_redesign_seed.sql. This is a CLEAN REBUILD of the
-- mock interview tables (not an in-place migration) — the taxonomy
-- changes shape (difficulty -> experience_level, category/role lists
-- shrink), so this drops and recreates everything. This deletes any
-- existing interview_attempts rows (only test/dev data exists at this
-- point, confirmed with the user). Unrelated to app/api/interview/route.ts
-- (the separate, pre-existing Gemini "generate questions from a PDF"
-- tool), left untouched.

drop table if exists public.interview_attempts cascade;
drop table if exists public.interview_questions cascade;
drop table if exists public.interview_sets cascade;
drop table if exists public.interview_categories cascade;
drop table if exists public.interview_roles cascade;

-- ============================================================
-- Catalog tables (public-read)
-- ============================================================

create table public.interview_categories (
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
-- category+role+experience_level.
create table public.interview_roles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- The bookable content unit (category x role x experience level).
create table public.interview_sets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references public.interview_categories(id) not null,
  role_id uuid references public.interview_roles(id) not null,
  experience_level text not null check (experience_level in ('fresher', '1-3-years', '3-5-years', '5-plus-years')),
  title text not null,
  description text not null,
  is_available boolean not null default false,
  estimated_minutes int not null default 20,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, role_id, experience_level)
);

-- interview_questions holds no secret/correct-answer data (open-ended
-- prompts only) so public read is safe here. Any future AI-grading
-- rubric/ideal-answer data must live in a NEW, separately-RLS'd table
-- (zero select policies, service-role-only) — never a column added to
-- this table, since its RLS is `using (true)` (public by default).
create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  interview_set_id uuid references public.interview_sets(id) on delete cascade not null,
  question text not null,
  question_type text not null check (question_type in ('short_text', 'long_text')), -- future: 'voice', 'video'
  sort_order int not null
);

-- ============================================================
-- User attempts (mutable in-progress row)
-- ============================================================

create table public.interview_attempts (
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

create unique index interview_attempts_one_in_progress_per_set
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
create policy "interview_attempts_delete_own" on public.interview_attempts for delete using (auth.uid() = user_id);

create index interview_sets_category_role_idx on public.interview_sets (category_id, role_id);
create index interview_questions_set_idx on public.interview_questions (interview_set_id, sort_order);
create index interview_attempts_user_set_idx on public.interview_attempts (user_id, interview_set_id);
create index interview_attempts_user_status_idx on public.interview_attempts (user_id, status);
