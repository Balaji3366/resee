-- NOTE: Run manually in the Supabase Dashboard SQL editor, AFTER
-- 0005_progress_module.sql. Seed content only — safe to re-run is NOT
-- guaranteed (no ON CONFLICT DO NOTHING on the content tables), so only
-- run this once against a given project.

-- ============================================================
-- Skills — 3 real, linked to existing content; 4 real rows with no
-- linked content yet (honestly 0%/"Not started", never fabricated).
-- ============================================================

insert into public.skills (slug, name, icon, sort_order) values
  ('javascript', 'JavaScript', '💻', 1),
  ('python', 'Python', '🐍', 2),
  ('react', 'React', '⚛️', 3),
  ('qa-testing', 'QA Testing', '🧪', 4),
  ('sql', 'SQL', '🗄️', 5),
  ('data-structures', 'Data Structures', '🧩', 6),
  ('cloud', 'Cloud', '☁️', 7);

update public.practice_topics
set skill_id = (select id from public.skills where slug = 'javascript')
where slug = 'javascript-fundamentals';

update public.practice_topics
set skill_id = (select id from public.skills where slug = 'python')
where slug = 'python-basics';

update public.course_modules
set skill_id = (select id from public.skills where slug = 'react')
where title = 'Building with React & APIs';

-- "Frontend Foundations" (HTML/CSS/JS mixed) intentionally stays
-- unlinked — no single skill honestly represents it.

-- ============================================================
-- Achievements — the 6 examples from the brief.
-- ============================================================

insert into public.achievements (slug, title, description, icon, sort_order) values
  ('first-lesson-completed', 'First Lesson Completed', 'Complete your first lesson in any course.', '📘', 1),
  ('first-quiz-passed', 'First Quiz Passed', 'Pass your first module quiz.', '✅', 2),
  ('seven-day-streak', '7-Day Streak', 'Stay active for 7 days in a row.', '🔥', 3),
  ('thirty-day-streak', '30-Day Streak', 'Stay active for 30 days in a row.', '🏆', 4),
  ('first-course-completed', 'First Course Completed', 'Finish every module and quiz in a course.', '🎓', 5),
  ('hundred-questions-solved', '100 Questions Solved', 'Solve 100 practice questions across topics and mock tests.', '💯', 6);
