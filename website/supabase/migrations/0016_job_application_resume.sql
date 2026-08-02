-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before this feature
-- works. Written with if-not-exists guards for idempotency.
--
-- Genuine gap found auditing Jobs & Career Hub: job_applications had no
-- link to Resume Studio at all — applying never recorded which resume
-- was used. Nullable + on delete set null so deleting a resume later
-- never breaks/cascades an existing application record.

alter table public.job_applications
  add column if not exists resume_id uuid references public.resumes(id) on delete set null;
