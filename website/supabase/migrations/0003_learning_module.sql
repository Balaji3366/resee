-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before the Learning
-- Module works. This is a wholly new table set (nothing to migrate away
-- from), but is still written with `if not exists` for idempotency.

-- ============================================================
-- Content tables (publicly readable, admin/seed-only writes)
-- ============================================================

create table if not exists public.learning_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category_id uuid references public.learning_categories(id),
  title text not null,
  tagline text,
  description text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  icon text not null,
  is_available boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  sort_order int not null,
  created_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.course_modules(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  slug text not null,
  title text not null,
  content text not null,
  key_takeaways text[] not null default '{}',
  estimated_minutes int not null default 5,
  sort_order int not null,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.course_modules(id) on delete cascade not null unique,
  course_id uuid references public.courses(id) on delete cascade not null,
  slug text not null,
  title text not null,
  passing_score int not null default 70 check (passing_score between 1 and 100),
  estimated_minutes int not null default 5,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

-- quiz_questions is intentionally NOT given a select policy below —
-- it is only ever read server-side via the service-role client, so
-- correct answers can never be fetched with the anon/browser key.
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question text not null,
  question_type text not null check (question_type in ('single_choice', 'multiple_select')),
  options jsonb not null,
  correct_option_ids jsonb not null,
  explanation text not null,
  sort_order int not null
);

-- ============================================================
-- User progress tables (own-row access only)
-- ============================================================

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  enrolled_at timestamptz not null default now(),
  last_lesson_id uuid references public.lessons(id),
  last_activity_at timestamptz,
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  course_id uuid not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id uuid references public.course_modules(id) on delete cascade not null,
  course_id uuid not null,
  lessons_completed_count int not null default 0,
  quiz_passed boolean not null default false,
  quiz_best_score int,
  completed_at timestamptz,
  unique (user_id, module_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  course_id uuid not null,
  module_id uuid not null,
  score int not null,
  passed boolean not null,
  answers jsonb not null,
  attempted_at timestamptz not null default now()
);

-- ============================================================
-- profiles additions (additive only, matches 0002's convention)
-- ============================================================

alter table public.profiles
  add column if not exists current_streak int not null default 0,
  add column if not exists longest_streak int not null default 0,
  add column if not exists last_activity_date date,
  add column if not exists total_learning_minutes int not null default 0;

-- ============================================================
-- RLS
-- ============================================================

alter table public.learning_categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security; -- no policies: admin-only
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.module_progress enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "learning_categories_public_read" on public.learning_categories for select using (true);
create policy "courses_public_read" on public.courses for select using (true);
create policy "course_modules_public_read" on public.course_modules for select using (true);
create policy "lessons_public_read" on public.lessons for select using (true);
create policy "quizzes_public_read" on public.quizzes for select using (true);

create policy "enrollments_select_own" on public.enrollments for select using (auth.uid() = user_id);
create policy "enrollments_insert_own" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "enrollments_update_own" on public.enrollments for update using (auth.uid() = user_id);

create policy "lesson_progress_select_own" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "lesson_progress_insert_own" on public.lesson_progress for insert with check (auth.uid() = user_id);

create policy "module_progress_select_own" on public.module_progress for select using (auth.uid() = user_id);
create policy "module_progress_insert_own" on public.module_progress for insert with check (auth.uid() = user_id);
create policy "module_progress_update_own" on public.module_progress for update using (auth.uid() = user_id);

create policy "quiz_attempts_select_own" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "quiz_attempts_insert_own" on public.quiz_attempts for insert with check (auth.uid() = user_id);

create index if not exists course_modules_course_idx on public.course_modules (course_id, sort_order);
create index if not exists lessons_module_idx on public.lessons (module_id, sort_order);
create index if not exists lesson_progress_user_course_idx on public.lesson_progress (user_id, course_id);
create index if not exists module_progress_user_course_idx on public.module_progress (user_id, course_id);
