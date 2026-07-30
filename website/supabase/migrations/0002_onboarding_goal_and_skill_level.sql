-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project before the new
-- onboarding flow's `goal` and `skill_level` fields will persist.
--
-- This migration is purely additive: it only ADDS columns. It does NOT
-- touch education, experience, current_skills, target_career, dream_company,
-- dream_salary, or interests — those columns must stay in place so any user
-- who already completed the old 5-step onboarding keeps their existing data.

alter table public.profiles
  add column if not exists goal text,
  add column if not exists skill_level text;
