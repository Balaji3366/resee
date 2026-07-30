-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before the Admin Panel
-- works. Written with if-not-exists/if-exists guards for idempotency.
--
-- AFTER running this file, you must ALSO manually insert your own user as
-- the first admin (there is no safe way for application code to bootstrap
-- this itself) — find your auth.users id in the Supabase Dashboard
-- (Authentication > Users), then run:
--
--   insert into public.admin_users (user_id, role)
--   values ('<your-auth-users-id>', 'super_admin');

-- ============================================================
-- Admin identity — existence of a row = is an admin; `role` =
-- permission level. RLS: exactly ONE policy (own-row select), no
-- insert/update/delete policy for any authenticated role — granting or
-- revoking admin access can only ever happen via the service-role
-- client (supabaseAdmin) from a trusted server context.
-- ============================================================

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('super_admin', 'admin', 'content_manager')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "admin_users_select_own" on public.admin_users
  for select using (auth.uid() = user_id);

-- ============================================================
-- Additive columns: courses (= "Learning Path" in the admin CMS UI)
-- ============================================================

alter table public.courses
  add column if not exists banner_url text,
  add column if not exists thumbnail_url text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'published', 'archived'));

-- One-time backfill so existing live rows aren't silently reset to draft.
update public.courses set status = 'published'
  where is_available = true and status = 'draft';

-- ============================================================
-- Additive columns: lessons
-- ============================================================

alter table public.lessons
  add column if not exists video_url text,
  add column if not exists pdf_url text,
  add column if not exists notes text,
  add column if not exists attachments jsonb not null default '[]';

-- ============================================================
-- Additive columns: quiz_questions (schema-only, future-ready — same
-- precedent as Practice's unbuilt fill_blank question type: no timer
-- UI/enforcement is built in this phase). No RLS change here — stays
-- at zero select policies, admin routes read/write it exclusively via
-- supabaseAdmin after their own requireAdmin() check.
-- ============================================================

alter table public.quiz_questions
  add column if not exists difficulty text,
  add column if not exists marks int not null default 1,
  add column if not exists time_limit_seconds int;

create index if not exists admin_users_user_idx on public.admin_users (user_id);
