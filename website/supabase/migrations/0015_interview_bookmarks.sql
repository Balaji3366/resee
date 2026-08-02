-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before this feature
-- works. Written with if-not-exists guards for idempotency.
--
-- Mirrors practice_bookmarks (0004_practice_module.sql) exactly, applied
-- to interview_questions — a genuine gap found auditing the Mock
-- Interview module: Practice has bookmarking, Interview didn't. Unlike
-- practice_questions, interview_questions has no select-policy
-- restriction (open-ended prompts hold no secret/correct-answer data),
-- so no service-role join is needed to read bookmarked question content.

create table if not exists public.interview_question_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references public.interview_questions(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

alter table public.interview_question_bookmarks enable row level security;

create policy "interview_question_bookmarks_select_own" on public.interview_question_bookmarks
  for select using (auth.uid() = user_id);
create policy "interview_question_bookmarks_insert_own" on public.interview_question_bookmarks
  for insert with check (auth.uid() = user_id);
create policy "interview_question_bookmarks_delete_own" on public.interview_question_bookmarks
  for delete using (auth.uid() = user_id);

create index if not exists interview_question_bookmarks_user_idx
  on public.interview_question_bookmarks (user_id);
