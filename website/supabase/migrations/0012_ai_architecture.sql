-- NOTE: This project has no Supabase CLI/MCP wired up in this
-- environment. Run this SQL manually in the Supabase Dashboard SQL
-- editor, then run 0012b_ai_architecture_seed.sql. This is pure
-- infrastructure — no existing table is touched, no existing AI route
-- (interview/resume/chat/quiz/summarize/pdf-chat/onboarding generation)
-- is modified. Nothing in the running app reads or writes these tables
-- yet; they exist for the lib/ai/** service layer that future AI
-- features will call.

-- ============================================================
-- Credits & Subscription
-- ============================================================

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('free', 'pro', 'enterprise')),
  name text not null,
  monthly_credits int, -- null = unlimited
  price_usd_cents int, -- descriptive only, no payment integration this phase
  features text[] not null default '{}',
  is_available boolean not null default true,
  sort_order int not null default 0
);

-- No insert/update RLS policy at all — every write goes through
-- supabaseAdmin in lib/ai/credits.ts. A user can never edit their own
-- balance by calling Supabase directly, same trust model as
-- admin_users.
create table public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_slug text not null references public.subscription_plans(slug) default 'free',
  status text not null default 'active' check (status in ('active', 'cancelled', 'trialing')),
  credits_remaining int, -- null = unlimited (mirrors plan.monthly_credits)
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Append-only ledger backing user_subscriptions.credits_remaining —
-- the "Credit History" this phase asks for.
create table public.ai_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount int not null, -- negative = spend, positive = grant/refill
  reason text not null,
  feature text,
  balance_after int,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AI Logging / Analytics — "AI Requests, Response Time, Token Usage,
-- Feature Usage, User Satisfaction" are all derived by querying these
-- two tables directly; no separate analytics/aggregation service is
-- built yet since nothing reads them until a future feature/admin view
-- exists.
-- ============================================================

create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  feature text not null,
  provider text not null,
  model text not null,
  status text not null check (status in ('success', 'error', 'rate_limited', 'cached')),
  prompt_tokens int,
  completion_tokens int,
  total_tokens int,
  latency_ms int,
  error_message text,
  created_at timestamptz not null default now()
);

-- Lightweight thumbs up/down per request — separate table so the
-- append-only request log stays clean.
create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  ai_request_id uuid references public.ai_requests(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating int not null check (rating in (-1, 1)),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ai_request_id, user_id)
);

-- ============================================================
-- AI Memory — a refresh-on-stale CACHE of the User Context Engine's
-- output. This is NOT chat history: it remembers career context
-- (goal, preferred role, skill level, learning progress), refreshed
-- periodically by lib/ai/memory.ts, never a message/conversation log.
-- ============================================================

create table public.ai_user_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  career_goal text,
  preferred_role text,
  skill_level text,
  learning_progress_summary jsonb,
  context_snapshot jsonb,
  refreshed_at timestamptz not null default now()
);

-- ============================================================
-- AI Cache Layer — caches actual AI *responses* (distinct from the
-- memory table above, which caches *context*), keyed by a hash of
-- feature+context+params, short TTL. Purely internal — no select
-- policy at all (service-role only), same "RLS enabled, zero
-- policies" pattern as quiz_questions/practice_questions.
-- ============================================================

create table public.ai_response_cache (
  cache_key text primary key,
  feature text not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.ai_credit_transactions enable row level security;
alter table public.ai_requests enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.ai_user_memory enable row level security;
alter table public.ai_response_cache enable row level security; -- no policies: service-role only

create policy "subscription_plans_public_read" on public.subscription_plans for select using (true);

create policy "user_subscriptions_select_own" on public.user_subscriptions for select using (auth.uid() = user_id);

create policy "ai_credit_transactions_select_own" on public.ai_credit_transactions for select using (auth.uid() = user_id);

create policy "ai_requests_select_own" on public.ai_requests for select using (auth.uid() = user_id);

create policy "ai_feedback_select_own" on public.ai_feedback for select using (auth.uid() = user_id);
create policy "ai_feedback_insert_own" on public.ai_feedback for insert with check (auth.uid() = user_id);
create policy "ai_feedback_update_own" on public.ai_feedback for update using (auth.uid() = user_id);

create policy "ai_user_memory_select_own" on public.ai_user_memory for select using (auth.uid() = user_id);

create index ai_requests_user_created_idx on public.ai_requests (user_id, created_at desc);
create index ai_requests_user_feature_created_idx on public.ai_requests (user_id, feature, created_at desc);
create index ai_credit_transactions_user_idx on public.ai_credit_transactions (user_id, created_at desc);
create index ai_response_cache_expires_idx on public.ai_response_cache (expires_at);
