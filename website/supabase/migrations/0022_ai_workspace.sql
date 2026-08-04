-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project. Written with
-- if-not-exists guards for full idempotency — safe to run even if a
-- prior attempt partially succeeded.
--
-- AI Workspace (docs/architecture/ai-workspace-architecture.md, §8.1).
-- Two additive columns on the existing chat_sessions table — no new
-- table, no backfill script, no destructive change:
--
--   mode: every existing row defaults to 'general', which is exactly
--   today's General Assistant behaviour — zero behaviour change for any
--   existing conversation. New sessions record which of the two AI
--   Workspace modes (General Assistant / Career Coach) they were
--   started in; mode is fixed for the lifetime of a session (switching
--   modes always starts a new session — see the architecture doc §4.2).
--
--   credit_charged_at: null until a Career Coach session's first
--   message charges its one session-scoped credit (Decision 2 — 1
--   credit per session, not per message). General Assistant sessions
--   never set this column. This is the fast-path check the route uses
--   before charging; the actual double-charge guarantee is the
--   idempotency key ('career_coach_session:<sessionId>') already
--   enforced by apply_ai_credit_transaction() (0019), not this column.

alter table public.chat_sessions
  add column if not exists mode text not null default 'general';

alter table public.chat_sessions
  drop constraint if exists chat_sessions_mode_check;
alter table public.chat_sessions
  add constraint chat_sessions_mode_check check (mode in ('general', 'career_coach'));

alter table public.chat_sessions
  add column if not exists credit_charged_at timestamptz;

-- The aiCareerCoaching flag (seeded false in 0018) already exists and
-- already maps to the "career_coaching" AIFeature slug — reused
-- unchanged as the gate for Career Coach mode's UI and server route.
-- Its description is updated here to reflect the shipped, conversational
-- scope (Decision 6) rather than v1.0's superseded single-turn design.
update public.feature_flags
set description = 'AI Workspace — Career Coach mode (conversational, session-based credit metering)'
where slug = 'aiCareerCoaching';
