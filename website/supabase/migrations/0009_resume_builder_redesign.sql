-- NOTE: Run manually in the Supabase Dashboard SQL editor, AFTER
-- 0009 is the next number after 0008_mock_interview_module.sql (an
-- unrelated migration). This redesigns the Resume Builder module: users
-- no longer choose a template or an active/archived status — templates
-- become a purely internal implementation detail (picked by app code via
-- lib/resumeTemplateSelection.ts), and archive/restore is removed
-- entirely per the new minimal "Resume Preview" allow-list. No real user
-- data exists yet for this module, so these are safe breaking changes.

alter table public.resumes drop column if exists status;
drop index if exists resumes_user_status_idx;
create index if not exists resumes_user_updated_idx on public.resumes (user_id, updated_at desc);

-- Cascades the inbound FK from resumes.template_slug automatically —
-- no need to know Postgres's auto-generated constraint name.
drop table if exists public.resume_templates cascade;

-- template_slug stays as a plain column (still needed to know which
-- internal renderer/PDF-exporter to use), now guarded by a check
-- constraint instead of an FK against a catalog table that no longer
-- exists. Couples the DB to the same two literals in
-- lib/resumeTemplateSelection.ts — adding a third template later means
-- a migration + code change together, same as today.
alter table public.resumes add constraint resumes_template_slug_check
  check (template_slug in ('modern', 'ats-friendly'));

-- The old default matched the old flexible content shape; every insert
-- now always supplies explicit content in the new fixed shape, so drop
-- the stale default rather than leave a misleading artifact.
alter table public.resumes alter column content drop default;
