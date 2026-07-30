-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before the Progress &
-- Analytics Module works. This is a wholly new table set (nothing to
-- migrate away from), but is still written with `if not exists` for
-- idempotency. Run this file, then 0005b_progress_module_seed.sql.

-- ============================================================
-- Skills catalog (publicly readable) + optional links from
-- Practice topics and Learning course_modules.
-- ============================================================

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Additive, nullable — content that clearly maps to one skill can link
-- to it; mixed-content modules (e.g. a module covering HTML+CSS+JS at
-- once) are intentionally left unlinked rather than mislabeled.
alter table public.practice_topics add column if not exists skill_id uuid references public.skills(id);
alter table public.course_modules add column if not exists skill_id uuid references public.skills(id);

-- ============================================================
-- Achievements catalog (publicly readable) + user log (own-row,
-- append-only — same pattern as lesson_progress/quiz_attempts).
-- ============================================================

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  icon text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- No new storage for Milestones, Performance Timeline, or Total Active
-- Days — all computed live from existing Learning/Practice tables.

-- ============================================================
-- RLS
-- ============================================================

alter table public.skills enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

create policy "skills_public_read" on public.skills for select using (true);
create policy "achievements_public_read" on public.achievements for select using (true);

create policy "user_achievements_select_own" on public.user_achievements for select using (auth.uid() = user_id);
create policy "user_achievements_insert_own" on public.user_achievements for insert with check (auth.uid() = user_id);

create index if not exists practice_topics_skill_idx on public.practice_topics (skill_id);
create index if not exists course_modules_skill_idx on public.course_modules (skill_id);
create index if not exists user_achievements_user_idx on public.user_achievements (user_id);
