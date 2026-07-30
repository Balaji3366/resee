-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before the Resume
-- Builder works. Wholly new tables — unrelated to resume_history (the
-- separate AI resume-analyzer feature, predates the migrations
-- convention, left untouched). Written with `if not exists` for
-- idempotency. Run this file, then 0007b_resume_builder_seed.sql.

-- ============================================================
-- Templates catalog (publicly readable, admin/seed-managed)
-- ============================================================

create table if not exists public.resume_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  thumbnail_url text,
  is_available boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Resumes — content is a single flexible JSONB document rather than
-- normalized per-section tables, matching this app's existing precedent
-- for flexible/nested data (lessons.attachments, quiz_questions.options).
-- This makes "add/edit/delete/reorder mixed section types" a natural
-- array operation instead of a shared sort_order spanning many tables.
-- ============================================================

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  template_slug text references public.resume_templates(slug) not null,
  title text not null default 'Untitled Resume',
  status text not null default 'active' check (status in ('active', 'archived')),
  content jsonb not null default '{"personalInfo":{},"sections":[]}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Version history — full-snapshot per throttled save (see
-- lib/resumeVersioning.ts). No independent existence outside its parent
-- resume, so RLS is enforced via an exists-subselect against resumes
-- rather than a denormalized user_id column.
-- ============================================================

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete cascade not null,
  content jsonb not null,
  version_number int not null,
  created_at timestamptz not null default now(),
  unique (resume_id, version_number)
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.resume_templates enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;

create policy "resume_templates_public_read" on public.resume_templates for select using (true);

create policy "resumes_select_own" on public.resumes for select using (auth.uid() = user_id);
create policy "resumes_insert_own" on public.resumes for insert with check (auth.uid() = user_id);
create policy "resumes_update_own" on public.resumes for update using (auth.uid() = user_id);
create policy "resumes_delete_own" on public.resumes for delete using (auth.uid() = user_id);

create policy "resume_versions_select_own" on public.resume_versions for select
  using (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));
create policy "resume_versions_insert_own" on public.resume_versions for insert
  with check (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));

create index if not exists resumes_user_status_idx on public.resumes (user_id, status, updated_at desc);
create index if not exists resume_versions_resume_idx on public.resume_versions (resume_id, version_number desc);
