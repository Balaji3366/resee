-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- Run this SQL manually in the Supabase Dashboard SQL editor. Wholly new,
-- foundation-only tables — no overlap with any business module (Learning,
-- Practice, Resume Studio, Mock Interview, Jobs untouched). Written with
-- `if not exists` for idempotency.
--
-- Two tables, both proposed in docs/architecture/database-architecture.md:
--   1. api_requests    — generic request log, backs lib/rateLimiting.ts
--                        and lib/logging/requestLogger.ts (mirrors the
--                        shape of the AI-only ai_requests table).
--   2. admin_audit_log — who did what as an admin, when (see
--                        docs/architecture/database-architecture.md's
--                        Admin & CMS section for the original proposal).

-- ============================================================
-- Generic request log — own-row select (a user could see their own
-- request history if ever surfaced), no insert policy: written only via
-- supabaseAdmin from lib/rateLimiting.ts / lib/logging/requestLogger.ts.
-- ============================================================

create table if not exists public.api_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  route text not null,
  method text not null,
  status int,
  latency_ms int,
  created_at timestamptz not null default now()
);

alter table public.api_requests enable row level security;

create policy "api_requests_select_own" on public.api_requests
  for select using (auth.uid() = user_id);

create index if not exists api_requests_user_created_idx
  on public.api_requests (user_id, created_at desc);
create index if not exists api_requests_user_route_created_idx
  on public.api_requests (user_id, route, created_at desc);

-- ============================================================
-- Admin audit log — append-only, service-role write only. No select
-- policy for regular users; admin-only read happens via a server route
-- that calls requireAdmin() first (same trust model as admin_users
-- itself: existence/values are trustworthy specifically because there's
-- no client write path).
-- ============================================================

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security; -- no policies: service-role only

create index if not exists admin_audit_log_admin_created_idx
  on public.admin_audit_log (admin_user_id, created_at desc);
