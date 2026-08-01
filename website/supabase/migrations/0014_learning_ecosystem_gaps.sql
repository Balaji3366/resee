-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before these features
-- work. Written with if-not-exists/if-exists guards for idempotency.
--
-- This migration fills confirmed gaps in the already-shipped Learning
-- (0003), Practice (0004), and Admin Panel (0006) modules: fill-in-the-
-- blank questions, course-level final exams, course completion
-- certificates, and Daily Challenge practice. It does not touch or
-- duplicate any existing table.

-- ============================================================
-- Fill-in-the-blank question type
--
-- Reuses the existing `options`/`correct_option_ids` jsonb columns
-- rather than adding parallel ones: for `fill_blank`, `options` is
-- stored as `[]` (unused) and `correct_option_ids` holds an array of
-- acceptable answer strings (matched case-insensitively/trimmed in
-- application code, not enforced by Postgres). This keeps one question
-- shape across all three question banks below instead of a second
-- column set that only fill_blank would use.
-- ============================================================

alter table public.quiz_questions
  drop constraint if exists quiz_questions_question_type_check;
alter table public.quiz_questions
  add constraint quiz_questions_question_type_check
  check (question_type in ('single_choice', 'multiple_select', 'fill_blank'));

alter table public.practice_questions
  drop constraint if exists practice_questions_question_type_check;
alter table public.practice_questions
  add constraint practice_questions_question_type_check
  check (question_type in ('single_choice', 'multiple_select', 'true_false', 'fill_blank'));

-- ============================================================
-- Course-level final exams — mirrors quizzes/quiz_questions/quiz_attempts
-- from 0003_learning_module.sql exactly, but scoped to a whole course
-- (one optional exam per course) instead of one module. Same security
-- pattern: exam questions are zero-select-policy, server-role only.
-- ============================================================

create table if not exists public.course_exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null unique,
  slug text not null,
  title text not null,
  passing_score int not null default 70 check (passing_score between 1 and 100),
  estimated_minutes int not null default 30,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.course_exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.course_exams(id) on delete cascade not null,
  question text not null,
  question_type text not null check (question_type in ('single_choice', 'multiple_select', 'fill_blank')),
  options jsonb not null,
  correct_option_ids jsonb not null,
  explanation text not null,
  sort_order int not null
);

create table if not exists public.course_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exam_id uuid references public.course_exams(id) on delete cascade not null,
  course_id uuid not null,
  score int not null,
  passed boolean not null,
  answers jsonb not null,
  attempted_at timestamptz not null default now()
);

-- ============================================================
-- Course completion certificates — issued once a user has completed
-- every module (and passed the course exam, if the course has one).
-- Certificate PDF rendering happens client-side (see lib/certificate-pdf),
-- same pattern as the existing resume PDF export — this table only
-- records that a certificate was earned and its human-facing number.
-- ============================================================

create table if not exists public.course_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  certificate_number text unique not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- Daily Challenge — a fixed set of practice questions shared by every
-- user on a given calendar date (so "today's challenge" means the same
-- thing for everyone), generated lazily on first request per day.
-- Reuses practice_questions as the question bank (no duplicated
-- content), same as mock_test_questions already does.
-- ============================================================

create table if not exists public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge_date date unique not null,
  question_ids jsonb not null,
  created_at timestamptz not null default now()
);

-- Unlike practice_attempts/mock_test_attempts (which allow a new
-- attempt after a previous one completes), a Daily Challenge is one
-- attempt total per day — the plain unique(user_id, challenge_date)
-- below enforces that regardless of status, so there's no need for
-- practice_attempts' partial "one in-progress" index pattern here.
create table if not exists public.daily_challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_date date not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  question_ids jsonb not null,
  answers jsonb not null default '{}',
  total_questions int not null,
  correct_count int,
  score int,
  time_taken_seconds int,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, challenge_date)
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.course_exams enable row level security;
alter table public.course_exam_questions enable row level security; -- no policies: admin-only
alter table public.course_exam_attempts enable row level security;
alter table public.course_certificates enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_challenge_attempts enable row level security;

create policy "course_exams_public_read" on public.course_exams for select using (true);

create policy "course_exam_attempts_select_own" on public.course_exam_attempts for select using (auth.uid() = user_id);
create policy "course_exam_attempts_insert_own" on public.course_exam_attempts for insert with check (auth.uid() = user_id);

create policy "course_certificates_select_own" on public.course_certificates for select using (auth.uid() = user_id);
create policy "course_certificates_insert_own" on public.course_certificates for insert with check (auth.uid() = user_id);

-- Only ids/ordering, never answer content — same reasoning as
-- mock_test_questions' public-read policy in 0004_practice_module.sql.
create policy "daily_challenges_public_read" on public.daily_challenges for select using (true);

create policy "daily_challenge_attempts_select_own" on public.daily_challenge_attempts for select using (auth.uid() = user_id);
create policy "daily_challenge_attempts_insert_own" on public.daily_challenge_attempts for insert with check (auth.uid() = user_id);
create policy "daily_challenge_attempts_update_own" on public.daily_challenge_attempts for update using (auth.uid() = user_id);

create index if not exists course_exam_questions_exam_idx on public.course_exam_questions (exam_id, sort_order);
create index if not exists course_exam_attempts_user_exam_idx on public.course_exam_attempts (user_id, exam_id);
create index if not exists course_certificates_user_idx on public.course_certificates (user_id);
create index if not exists daily_challenge_attempts_user_date_idx on public.daily_challenge_attempts (user_id, challenge_date);
