-- NOTE: Run manually in the Supabase Dashboard SQL editor, AFTER
-- 0010_mock_interview_redesign.sql. Seed content only.

-- ============================================================
-- Categories — all 3 real, none hidden
-- ============================================================

insert into public.interview_categories (slug, name, icon, description, is_available, sort_order) values
  ('hr', 'HR Interview', '🤝', 'Communication, culture fit, and career motivation questions.', true, 1),
  ('technical', 'Technical Interview', '💻', 'Core technical knowledge and problem-solving questions for your role.', true, 2),
  ('behavioural', 'Behavioural Interview', '🧠', 'Past-experience questions that reveal how you work with others.', true, 3);

-- ============================================================
-- Roles — all 9, honestly complete (architecture supports unlimited
-- careers; availability of actual content is a property of
-- interview_sets, not of the role itself)
-- ============================================================

insert into public.interview_roles (slug, name, icon, sort_order) values
  ('qa-engineer', 'QA Engineer', '🐞', 1),
  ('software-engineer', 'Software Engineer', '💻', 2),
  ('frontend-developer', 'Frontend Developer', '🎨', 3),
  ('backend-developer', 'Backend Developer', '⚙️', 4),
  ('data-analyst', 'Data Analyst', '📊', 5),
  ('ai-engineer', 'AI Engineer', '🤖', 6),
  ('devops-engineer', 'DevOps Engineer', '🛠️', 7),
  ('ui-ux-designer', 'UI/UX Designer', '🖌️', 8),
  ('product-manager', 'Product Manager', '📋', 9);

-- ============================================================
-- Interview sets — Software Engineer x Fresher x all 3 types only.
-- Every other role/experience/type combination has no matching row
-- here, which IS "not available yet".
-- ============================================================

insert into public.interview_sets (slug, category_id, role_id, experience_level, title, description, is_available, estimated_minutes, sort_order)
select
  'software-engineer-fresher-hr',
  (select id from public.interview_categories where slug = 'hr'),
  (select id from public.interview_roles where slug = 'software-engineer'),
  'fresher',
  'Software Engineer — HR Interview',
  'Common HR questions asked to fresher software engineers.',
  true, 20, 1
union all
select
  'software-engineer-fresher-technical',
  (select id from public.interview_categories where slug = 'technical'),
  (select id from public.interview_roles where slug = 'software-engineer'),
  'fresher',
  'Software Engineer — Technical Interview',
  'Core technical concepts every fresher software engineer should know.',
  true, 25, 2
union all
select
  'software-engineer-fresher-behavioural',
  (select id from public.interview_categories where slug = 'behavioural'),
  (select id from public.interview_roles where slug = 'software-engineer'),
  'fresher',
  'Software Engineer — Behavioural Interview',
  'Past-experience questions covering teamwork, conflict, and growth.',
  true, 20, 3;

-- ============================================================
-- Questions — 8 per set (24 total)
-- ============================================================

insert into public.interview_questions (interview_set_id, question, question_type, sort_order)
select (select id from public.interview_sets where slug = 'software-engineer-fresher-hr'), q.question, q.question_type, q.sort_order
from (values
  ('Tell me about yourself and your journey as a software engineer.', 'long_text', 1),
  ('Why do you want to work with our company?', 'long_text', 2),
  ('What are your greatest strengths as an engineer?', 'long_text', 3),
  ('What is one weakness you''re actively working to improve?', 'long_text', 4),
  ('Where do you see yourself in the next 3-5 years?', 'long_text', 5),
  ('Why are you looking to leave your current role?', 'long_text', 6),
  ('What kind of work environment helps you do your best work?', 'long_text', 7),
  ('Do you have any questions for us?', 'long_text', 8)
) as q(question, question_type, sort_order);

insert into public.interview_questions (interview_set_id, question, question_type, sort_order)
select (select id from public.interview_sets where slug = 'software-engineer-fresher-technical'), q.question, q.question_type, q.sort_order
from (values
  ('Explain the difference between let, const, and var in JavaScript.', 'short_text', 1),
  ('What is the time complexity of binary search, and why?', 'short_text', 2),
  ('Explain the difference between SQL and NoSQL databases.', 'long_text', 3),
  ('What is the difference between synchronous and asynchronous code execution?', 'long_text', 4),
  ('How would you design a URL shortening service like bit.ly?', 'long_text', 5),
  ('What is a REST API, and what makes an API RESTful?', 'long_text', 6),
  ('Explain the concept of Big-O notation and why it matters.', 'long_text', 7),
  ('What''s the difference between a process and a thread?', 'short_text', 8)
) as q(question, question_type, sort_order);

insert into public.interview_questions (interview_set_id, question, question_type, sort_order)
select (select id from public.interview_sets where slug = 'software-engineer-fresher-behavioural'), q.question, q.question_type, q.sort_order
from (values
  ('Describe a time you disagreed with a teammate. How did you resolve it?', 'long_text', 1),
  ('Tell me about a project you''re most proud of and why.', 'long_text', 2),
  ('Describe a time you made a mistake at work. What did you learn?', 'long_text', 3),
  ('Tell me about a time you had to learn a new technology quickly.', 'long_text', 4),
  ('Describe a situation where you had to give difficult feedback to a peer.', 'long_text', 5),
  ('Tell me about a time you missed a deadline. What happened?', 'long_text', 6),
  ('Describe a time you took initiative without being asked.', 'long_text', 7),
  ('How do you handle working with someone whose working style is very different from yours?', 'long_text', 8)
) as q(question, question_type, sort_order);
