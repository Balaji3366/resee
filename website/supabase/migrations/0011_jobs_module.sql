-- NOTE: This project has no Supabase CLI/MCP wired up in this
-- environment. Run this SQL manually in the Supabase Dashboard SQL
-- editor, then run 0011b_jobs_module_seed.sql. Wholly new tables — no
-- overlap with any existing module.

-- ============================================================
-- Jobs catalog (public-read, no secret data, no "unavailable" concept —
-- every seeded posting is equally real and browsable, unlike Practice
-- topics / Interview sets which have a Coming Soon tier).
-- ============================================================

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  company text not null,
  -- Aligned to interview_roles.slug vocabulary where possible (e.g.
  -- 'software-engineer') — not a hard FK, so postings for roles outside
  -- that 9-role list aren't blocked.
  role_slug text,
  location text not null,
  work_mode text not null check (work_mode in ('remote', 'hybrid', 'onsite')),
  job_type text not null check (job_type in ('full-time', 'part-time', 'internship', 'contract')),
  -- Same 4-bucket taxonomy as interview_sets.experience_level, for
  -- consistency across modules.
  experience_level text not null check (experience_level in ('fresher', '1-3-years', '3-5-years', '5-plus-years')),
  -- Continuous values kept alongside the bucket — bucketing is a lossy
  -- one-way transform, and only the bucket drives UI filtering this
  -- phase, but the raw numbers aren't discarded.
  experience_min_years int,
  experience_max_years int,
  -- LPA (Lakhs Per Annum) — India-focused convention, no schema-level
  -- unit column, documented here.
  salary_min int,
  salary_max int,
  skills text[] not null default '{}',
  description text not null,
  responsibilities text[] not null default '{}',
  eligibility text[] not null default '{}',
  apply_url text,
  is_available boolean not null default true,
  posted_at timestamptz not null default now()
);

-- ============================================================
-- User-owned tables
-- ============================================================

create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

-- No delete policy — "Archived" is an explicit terminal status in the
-- product spec, making a real delete redundant (archived already means
-- "done, tucked away"). Accepted limitation: unique(user_id,job_id) with
-- no delete means a user who reaches 'archived' can't re-track a fresh
-- application to that same job later (e.g. reapplying after 6 months) —
-- fine for this MVP.
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  status text not null default 'applied' check (status in ('applied', 'interview_scheduled', 'offer_received', 'rejected', 'archived')),
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table public.job_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_roles text[] not null default '{}',
  preferred_locations text[] not null default '{}',
  preferred_work_mode text check (preferred_work_mode in ('remote', 'hybrid', 'onsite')),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.jobs enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.job_preferences enable row level security;

create policy "jobs_public_read" on public.jobs for select using (true);

create policy "saved_jobs_select_own" on public.saved_jobs for select using (auth.uid() = user_id);
create policy "saved_jobs_insert_own" on public.saved_jobs for insert with check (auth.uid() = user_id);
create policy "saved_jobs_delete_own" on public.saved_jobs for delete using (auth.uid() = user_id);

create policy "job_applications_select_own" on public.job_applications for select using (auth.uid() = user_id);
create policy "job_applications_insert_own" on public.job_applications for insert with check (auth.uid() = user_id);
create policy "job_applications_update_own" on public.job_applications for update using (auth.uid() = user_id);

create policy "job_preferences_select_own" on public.job_preferences for select using (auth.uid() = user_id);
create policy "job_preferences_insert_own" on public.job_preferences for insert with check (auth.uid() = user_id);
create policy "job_preferences_update_own" on public.job_preferences for update using (auth.uid() = user_id);

create index jobs_role_slug_idx on public.jobs (role_slug);
create index jobs_posted_at_idx on public.jobs (posted_at desc);
create index saved_jobs_user_idx on public.saved_jobs (user_id);
create index job_applications_user_status_idx on public.job_applications (user_id, status);
