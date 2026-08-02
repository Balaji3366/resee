-- NOTE: This project has no Supabase CLI/MCP wired up in this environment.
-- You must run this SQL manually in the Supabase Dashboard SQL editor
-- (or `supabase db execute`) against your project. Written with
-- if-not-exists guards and drop-then-create functions/policies for full
-- idempotency — safe to run even if a prior attempt partially succeeded.
--
-- AI Phase 0.5 (credit integrity + privacy hardening), implementing
-- Decisions 3, 7, 8, 9 from docs/product/ai-product-specification.md:
--
--   1. Idempotent credit transactions — every apply_ai_credit_transaction
--      call carries an idempotency key; a unique index makes a retried
--      or duplicated call a safe no-op (returns the original result)
--      instead of a second charge.
--   2. Transactional credit deduction/grant — apply_ai_credit_transaction()
--      is a single Postgres function: the balance update and the ledger
--      insert happen inside one implicit transaction, so they always
--      succeed or fail together. Row-locked via `for update` so
--      concurrent calls for the same user serialize instead of racing.
--   3. Lazy monthly reset — ensure_subscription_period() checks
--      current_period_end on every call; if expired, atomically resets
--      credits_remaining to the plan's monthly allotment, advances the
--      period, and logs a "Monthly Credit Reset" ledger row (itself
--      idempotency-keyed on the old period_end, so a race between two
--      concurrent requests at the exact reset boundary can't double-log).
--   4. Free plan corrected from 20 to 15 monthly credits (Decision 3).
--   5. ai_response_cache gains a nullable user_id column so a user's
--      cached AI responses can be identified and deleted via the new
--      "Delete my AI history" privacy feature — historical rows created
--      before this migration have no user_id and simply expire via their
--      existing TTL, unaffected.

-- ============================================================
-- Idempotency key on the credit ledger
-- ============================================================

alter table public.ai_credit_transactions
  add column if not exists idempotency_key text;

create unique index if not exists ai_credit_transactions_idempotency_key_uidx
  on public.ai_credit_transactions (idempotency_key)
  where idempotency_key is not null;

-- ============================================================
-- ai_response_cache user scoping (for AI history deletion)
-- ============================================================

alter table public.ai_response_cache
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists ai_response_cache_user_idx
  on public.ai_response_cache (user_id);

-- ============================================================
-- Free plan credit correction (20 -> 15, Decision 3)
-- ============================================================

update public.subscription_plans
set monthly_credits = 15
where slug = 'free' and monthly_credits = 20;

-- ============================================================
-- apply_ai_credit_transaction — atomic + idempotent balance/ledger write.
-- Positive p_amount = grant, negative = deduct. Caller must have already
-- ensured a user_subscriptions row exists (lib/ai/credits.ts always
-- does this before calling). Returns the resulting balance (null means
-- unlimited plan) and whether this call was a replay of an
-- already-processed idempotency key.
-- ============================================================

create or replace function public.apply_ai_credit_transaction(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_feature text,
  p_idempotency_key text
)
returns table (balance_after integer, replayed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_balance integer;
  v_existing_found boolean := false;
  v_is_unlimited boolean;
  v_credits_remaining integer;
begin
  if p_idempotency_key is not null then
    select t.balance_after into v_existing_balance
    from public.ai_credit_transactions t
    where t.idempotency_key = p_idempotency_key
    limit 1;

    v_existing_found := found;

    if v_existing_found then
      return query select v_existing_balance, true;
      return;
    end if;
  end if;

  select (credits_remaining is null) into v_is_unlimited
  from public.user_subscriptions
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'apply_ai_credit_transaction: no user_subscriptions row for user %', p_user_id;
  end if;

  if v_is_unlimited then
    insert into public.ai_credit_transactions (user_id, amount, reason, feature, balance_after, idempotency_key)
    values (p_user_id, p_amount, p_reason, p_feature, null, p_idempotency_key);

    return query select null::integer, false;
    return;
  end if;

  update public.user_subscriptions
  set credits_remaining = credits_remaining + p_amount, updated_at = now()
  where user_id = p_user_id
  returning credits_remaining into v_credits_remaining;

  insert into public.ai_credit_transactions (user_id, amount, reason, feature, balance_after, idempotency_key)
  values (p_user_id, p_amount, p_reason, p_feature, v_credits_remaining, p_idempotency_key);

  return query select v_credits_remaining, false;
end;
$$;

-- ============================================================
-- ensure_subscription_period — lazy monthly reset, checked on every
-- subscription access (Decision 9). Locks the row; if no row exists,
-- returns null (callers decide whether that means "compute a virtual
-- default" or "materialize a row now" — unchanged existing behavior).
-- A row with no period_end yet (created before this migration) gets one
-- initialized without touching its balance or logging a reset — only a
-- genuinely *expired* period triggers a real reset + ledger entry.
-- ============================================================

-- returns setof (not a bare composite type) so that "no row exists" comes
-- back as an EMPTY RESULT SET, not a NULL-valued row. A bare
-- `returns public.user_subscriptions` function that does `return null`
-- gets serialized by PostgREST as an object with every field set to
-- null (e.g. {"user_id": null, ...}) rather than JSON `null` -- which a
-- naive `data ?? null` check in JS would treat as a truthy "row found"
-- result. setof + an empty return avoids that trap entirely: the JS
-- caller gets a genuinely empty array back for "no row," matching the
-- same array-shaped handling already used for apply_ai_credit_transaction.
-- CREATE OR REPLACE cannot change a function's return type, and this
-- migration changes it from a bare composite to `setof` (see comment
-- below) -- drop first so this file stays re-runnable regardless of
-- which version of the function a prior run left in place.
drop function if exists public.ensure_subscription_period(uuid);

create function public.ensure_subscription_period(p_user_id uuid)
returns setof public.user_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.user_subscriptions%rowtype;
  v_monthly_credits integer;
  v_reset_key text;
begin
  select * into v_sub from public.user_subscriptions where user_id = p_user_id for update;

  if not found then
    return;
  end if;

  if v_sub.current_period_end is null then
    update public.user_subscriptions
    set current_period_start = now(),
        current_period_end = now() + interval '30 days',
        updated_at = now()
    where user_id = p_user_id
    returning * into v_sub;

    return next v_sub;
    return;
  end if;

  if v_sub.current_period_end >= now() then
    return next v_sub;
    return;
  end if;

  select monthly_credits into v_monthly_credits
  from public.subscription_plans
  where slug = v_sub.plan_slug;

  v_reset_key := 'monthly_reset:' || p_user_id::text || ':' || v_sub.current_period_end::text;

  update public.user_subscriptions
  set credits_remaining = v_monthly_credits,
      current_period_start = now(),
      current_period_end = now() + interval '30 days',
      updated_at = now()
  where user_id = p_user_id
  returning * into v_sub;

  insert into public.ai_credit_transactions (user_id, amount, reason, feature, balance_after, idempotency_key)
  values (p_user_id, coalesce(v_monthly_credits, 0), 'Monthly Credit Reset', null, v_sub.credits_remaining, v_reset_key)
  on conflict (idempotency_key) where idempotency_key is not null do nothing;

  return next v_sub;
  return;
end;
$$;
