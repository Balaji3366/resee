-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before the Practice
-- & Assessment Module works. This is a wholly new table set (nothing to
-- migrate away from), but is still written with `if not exists` for
-- idempotency. Run this file, then 0004b_practice_module_seed.sql.

-- ============================================================
-- Content tables (publicly readable, admin/seed-only writes)
-- ============================================================

create table if not exists public.practice_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.practice_topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references public.practice_categories(id),
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  icon text not null,
  is_available boolean not null default false,
  estimated_minutes int not null default 15,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- practice_questions is intentionally NOT given a select policy below —
-- it is only ever read server-side via the service-role client, so
-- correct answers can never be fetched with the anon/browser key.
-- Same security pattern as quiz_questions in 0003_learning_module.sql.
create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.practice_topics(id) on delete cascade not null,
  question text not null,
  question_type text not null check (question_type in ('single_choice', 'multiple_select', 'true_false')),
  options jsonb not null,
  correct_option_ids jsonb not null,
  explanation text not null,
  sort_order int not null
);

create table if not exists public.mock_tests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_minutes int not null,
  is_available boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Links to practice_questions directly — reuses the same question bank,
-- no duplicated question content. Public-read is safe here: this table
-- only holds ids/ordering, never answer content.
create table if not exists public.mock_test_questions (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid references public.mock_tests(id) on delete cascade not null,
  question_id uuid references public.practice_questions(id) on delete cascade not null,
  sort_order int not null,
  unique (mock_test_id, question_id)
);

-- ============================================================
-- User attempt tables (own-row access only)
--
-- Unlike Learning's quiz_attempts (insert-only-on-submit), these store a
-- mutable in-progress row: created at session start (snapshotting an
-- ordered question_ids array), autosaved via answers jsonb, and updated
-- to 'completed' on submit. This is what lets "Continue Practice" surface
-- unfinished sessions across a refresh/different device.
-- ============================================================

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic_id uuid references public.practice_topics(id) on delete cascade not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  question_ids jsonb not null,
  answers jsonb not null default '{}',
  total_questions int not null,
  correct_count int,
  score int,
  time_taken_seconds int,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists practice_attempts_one_in_progress_per_topic
  on public.practice_attempts (user_id, topic_id) where (status = 'in_progress');

create table if not exists public.mock_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mock_test_id uuid references public.mock_tests(id) on delete cascade not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  question_ids jsonb not null,
  answers jsonb not null default '{}',
  total_questions int not null,
  correct_count int,
  score int,
  time_taken_seconds int,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists mock_test_attempts_one_in_progress_per_test
  on public.mock_test_attempts (user_id, mock_test_id) where (status = 'in_progress');

-- Bookmarks need real toggle-off, so this gets select+insert+delete
-- (own-row), unlike the append-only-log / mutable-progress tables above.
create table if not exists public.practice_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references public.practice_questions(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

-- Append-only log — no admin review UI this phase, just an honest record.
create table if not exists public.practice_question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references public.practice_questions(id) on delete cascade not null,
  reason text,
  created_at timestamptz not null default now()
);

-- No profiles changes here — reuses current_streak/longest_streak/
-- last_activity_date/total_learning_minutes added in 0003_learning_module.sql.

-- ============================================================
-- RLS
-- ============================================================

alter table public.practice_categories enable row level security;
alter table public.practice_topics enable row level security;
alter table public.practice_questions enable row level security; -- no policies: admin-only
alter table public.mock_tests enable row level security;
alter table public.mock_test_questions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.mock_test_attempts enable row level security;
alter table public.practice_bookmarks enable row level security;
alter table public.practice_question_reports enable row level security;

create policy "practice_categories_public_read" on public.practice_categories for select using (true);
create policy "practice_topics_public_read" on public.practice_topics for select using (true);
create policy "mock_tests_public_read" on public.mock_tests for select using (true);
create policy "mock_test_questions_public_read" on public.mock_test_questions for select using (true);

create policy "practice_attempts_select_own" on public.practice_attempts for select using (auth.uid() = user_id);
create policy "practice_attempts_insert_own" on public.practice_attempts for insert with check (auth.uid() = user_id);
create policy "practice_attempts_update_own" on public.practice_attempts for update using (auth.uid() = user_id);

create policy "mock_test_attempts_select_own" on public.mock_test_attempts for select using (auth.uid() = user_id);
create policy "mock_test_attempts_insert_own" on public.mock_test_attempts for insert with check (auth.uid() = user_id);
create policy "mock_test_attempts_update_own" on public.mock_test_attempts for update using (auth.uid() = user_id);

create policy "practice_bookmarks_select_own" on public.practice_bookmarks for select using (auth.uid() = user_id);
create policy "practice_bookmarks_insert_own" on public.practice_bookmarks for insert with check (auth.uid() = user_id);
create policy "practice_bookmarks_delete_own" on public.practice_bookmarks for delete using (auth.uid() = user_id);

create policy "practice_question_reports_select_own" on public.practice_question_reports for select using (auth.uid() = user_id);
create policy "practice_question_reports_insert_own" on public.practice_question_reports for insert with check (auth.uid() = user_id);

create index if not exists practice_topics_category_idx on public.practice_topics (category_id, sort_order);
create index if not exists practice_questions_topic_idx on public.practice_questions (topic_id, sort_order);
create index if not exists mock_test_questions_test_idx on public.mock_test_questions (mock_test_id, sort_order);
create index if not exists practice_attempts_user_topic_idx on public.practice_attempts (user_id, topic_id);
create index if not exists practice_attempts_user_status_idx on public.practice_attempts (user_id, status);
create index if not exists mock_test_attempts_user_test_idx on public.mock_test_attempts (user_id, mock_test_id);
create index if not exists mock_test_attempts_user_status_idx on public.mock_test_attempts (user_id, status);
