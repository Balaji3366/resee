-- NOTE: Run manually in the Supabase Dashboard SQL editor, AFTER
-- 0007_resume_builder.sql. Seed content only — safe to re-run is NOT
-- guaranteed (no ON CONFLICT DO NOTHING), so only run this once against
-- a given project.

insert into public.resume_templates (slug, name, description, is_available, sort_order) values
  ('modern', 'Modern', 'A clean, contemporary layout with a small accent color.', true, 1),
  ('ats-friendly', 'ATS Friendly', 'Maximally simple single-column layout, no graphics or tables, optimized for ATS parsers.', true, 2),
  ('minimal', 'Minimal', 'A stripped-back, whitespace-forward layout.', false, 3),
  ('professional', 'Professional', 'A formal, traditional corporate layout.', false, 4),
  ('executive', 'Executive', 'A senior-leadership-oriented layout with a summary-first structure.', false, 5),
  ('creative', 'Creative', 'A bolder layout for design and creative roles.', false, 6);
