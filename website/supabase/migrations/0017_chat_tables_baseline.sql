-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project. Written with
-- if-not-exists guards (tables, columns, indexes) and drop-then-create
-- policies for full idempotency — safe to run even though these tables
-- already exist live, and safe to re-run if a prior attempt failed partway.
--
-- `chat_sessions`, `chat_messages`, `chat_history` back the general AI
-- career-assistant chat (app/api/chat/**, components/AIChat.tsx) and were
-- created directly in the Supabase dashboard, outside this migration
-- history entirely — an AI-readiness-audit finding this migration closes.
-- Column shapes below are reverse-engineered from the exact fields every
-- app/api/chat/** route reads/writes, not guessed.
--
-- IMPORTANT SECURITY FINDING (documented here, not silently fixed): none
-- of app/api/chat/** currently filters by an authenticated user — there
-- is no user_id column today, so `GET /api/chat/sessions` returns every
-- user's sessions, and `/api/chat/[id]` lets anyone read or delete any
-- session by id. This migration adds a NULLABLE `user_id` column plus
-- real RLS policies so the fix is ready to land, but does NOT change any
-- app/api/chat/** route — that requires each route to start reading the
-- authenticated user and filtering by it, which is a behavior change to
-- "legacy" code this phase was explicitly scoped not to make silently.
-- All existing/new rows keep user_id = null until that follow-up ships,
-- and RLS below denies anon/authenticated direct access in the
-- meantime (a strict improvement — the app itself reads/writes these
-- tables via the service-role client, which bypasses RLS regardless).

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  sender text not null,
  message text not null,
  attachment_name text,
  attachment_url text,
  attachment_type text,
  attachment_size bigint,
  created_at timestamptz not null default now()
);

-- Written to by app/api/chat/route.ts (the separate, apparently-orphaned
-- endpoint — no caller found anywhere in the app; kept here for
-- reproducibility of what exists live, not an endorsement that it's used).
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_message text not null,
  ai_response text not null,
  created_at timestamptz not null default now()
);

-- All three tables above already exist live (created ad hoc, pre-dating
-- this migration entirely) — `create table if not exists` is a no-op
-- against an existing table and does NOT retroactively add columns to
-- it. The live chat_sessions/chat_history tables predate user_id, so it
-- must be added explicitly here, or every statement below that
-- references user_id (RLS policies, indexes) fails with
-- "42703: column user_id does not exist".
alter table public.chat_sessions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.chat_history add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- ============================================================
-- RLS — own-row, matching every other user-owned table's pattern.
-- Effectively deny-all today since user_id is null on every existing
-- row; becomes real protection the moment the route-level fix ships.
-- ============================================================

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_history enable row level security;

-- create policy has no IF NOT EXISTS in Postgres — drop-then-create makes
-- this block safely re-runnable (relevant here since an earlier partial
-- run of this file failed partway through on the missing user_id column
-- above, potentially after some of these had already been created).
drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own" on public.chat_sessions for select using (auth.uid() = user_id);
drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own" on public.chat_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "chat_sessions_delete_own" on public.chat_sessions;
create policy "chat_sessions_delete_own" on public.chat_sessions for delete using (auth.uid() = user_id);

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own" on public.chat_messages for select
  using (exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid()));
drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own" on public.chat_messages for insert
  with check (exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid()));
drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own" on public.chat_messages for delete
  using (exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid()));

drop policy if exists "chat_history_select_own" on public.chat_history;
create policy "chat_history_select_own" on public.chat_history for select using (auth.uid() = user_id);
drop policy if exists "chat_history_insert_own" on public.chat_history;
create policy "chat_history_insert_own" on public.chat_history for insert with check (auth.uid() = user_id);

create index if not exists chat_sessions_user_idx on public.chat_sessions (user_id, created_at desc);
create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);
create index if not exists chat_history_user_idx on public.chat_history (user_id, created_at desc);
