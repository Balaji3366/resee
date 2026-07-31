-- NOTE: Run manually in the Supabase Dashboard SQL editor, AFTER
-- 0012_ai_architecture.sql. Seed content only. Credit amounts below are
-- placeholder defaults, easily tuned later — no feature reads them yet.

insert into public.subscription_plans (slug, name, monthly_credits, price_usd_cents, features, is_available, sort_order) values
  ('free', 'Free', 20, 0, ARRAY['20 AI credits per month', 'Core learning, practice, and resume tools'], true, 1),
  ('pro', 'Pro', 300, 999, ARRAY['300 AI credits per month', 'Priority AI processing', 'Advanced resume and interview tools'], true, 2),
  ('enterprise', 'Enterprise', null, null, ARRAY['Unlimited AI credits', 'Team management', 'Dedicated support'], true, 3);
