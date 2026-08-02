import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AIFeature, SubscriptionPlanSlug, UserSubscription } from "@/types/ai";

const DEFAULT_PLAN: SubscriptionPlanSlug = "free";
const PERIOD_LENGTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function toSubscription(row: Record<string, unknown>): UserSubscription {
  return {
    userId: row.user_id as string,
    planSlug: row.plan_slug as SubscriptionPlanSlug,
    status: row.status as UserSubscription["status"],
    creditsRemaining: (row.credits_remaining as number) ?? null,
    currentPeriodStart: row.current_period_start as string,
    currentPeriodEnd: (row.current_period_end as string) ?? null,
  };
}

/**
 * Locks the user's subscription row (if it exists) and applies the lazy
 * monthly reset (Decision 9) atomically via ensure_subscription_period():
 * resets credits_remaining to the plan default, advances the period, and
 * logs a "Monthly Credit Reset" ledger entry, all in one Postgres
 * function call — but only when the period has genuinely expired.
 * Returns null if no row exists yet; callers decide what that means.
 */
async function ensureSubscriptionPeriod(userId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabaseAdmin.rpc("ensure_subscription_period", {
    p_user_id: userId,
  });

  if (error) throw new Error(`ensure_subscription_period failed: ${error.message}`);

  // The function returns setof — supabase-js gives back an array (empty
  // when no row exists), never a null-valued composite object.
  const row = Array.isArray(data) ? data[0] : data;
  return (row as Record<string, unknown> | undefined) ?? null;
}

/**
 * Lazy default — no row means Free plan, matching the same
 * no-row-means-default pattern already used for job_preferences. A row
 * only gets materialized on first credit-consuming action. Whenever a
 * row *does* already exist, this also applies the lazy monthly reset
 * (Decision 9) before returning it.
 */
export async function getSubscription(userId: string): Promise<UserSubscription> {
  const existing = await ensureSubscriptionPeriod(userId);
  if (existing) return toSubscription(existing);

  const { data: plan } = await supabaseAdmin
    .from("subscription_plans")
    .select("monthly_credits")
    .eq("slug", DEFAULT_PLAN)
    .maybeSingle();

  return {
    userId,
    planSlug: DEFAULT_PLAN,
    status: "active",
    creditsRemaining: plan?.monthly_credits ?? null,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: null,
  };
}

async function ensureSubscriptionRow(userId: string): Promise<UserSubscription> {
  const existing = await ensureSubscriptionPeriod(userId);
  if (existing) return toSubscription(existing);

  const virtual = await getSubscription(userId);

  const periodStart = new Date();
  const periodEnd = new Date(periodStart.getTime() + PERIOD_LENGTH_MS);

  const { data: created, error } = await supabaseAdmin
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      plan_slug: virtual.planSlug,
      status: virtual.status,
      credits_remaining: virtual.creditsRemaining,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create subscription row: ${error.message}`);

  return toSubscription(created);
}

export async function hasCredits(userId: string, amount: number): Promise<boolean> {
  const subscription = await getSubscription(userId);
  if (subscription.creditsRemaining === null) return true; // unlimited
  return subscription.creditsRemaining >= amount;
}

/**
 * The single atomic, idempotent write path for every credit change —
 * both deductCredits() and grantCredits() funnel through here into the
 * apply_ai_credit_transaction() Postgres function, which updates the
 * balance and inserts the ledger row in one transaction and treats a
 * repeated idempotencyKey as a safe no-op rather than a second charge.
 */
async function applyCreditTransaction(
  userId: string,
  amount: number,
  reason: string,
  feature: AIFeature | null,
  idempotencyKey: string
): Promise<number | null> {
  await ensureSubscriptionRow(userId);

  const { data, error } = await supabaseAdmin.rpc("apply_ai_credit_transaction", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_feature: feature,
    p_idempotency_key: idempotencyKey,
  });

  if (error) throw new Error(`apply_ai_credit_transaction failed: ${error.message}`);

  const row = (Array.isArray(data) ? data[0] : data) as
    { balance_after: number | null; replayed: boolean } | undefined;

  return row?.balance_after ?? null;
}

/**
 * Deducts credits for a completed AI feature call. `idempotencyKey`
 * should be supplied by the caller (one key per logical AI request) so a
 * retried or duplicated call can never deduct twice for the same
 * request — defaults to a fresh UUID only for callers that don't yet
 * have a stable key of their own.
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  feature: AIFeature,
  idempotencyKey: string = randomUUID()
): Promise<void> {
  await applyCreditTransaction(userId, -amount, reason, feature, idempotencyKey);
}

export async function grantCredits(
  userId: string,
  amount: number,
  reason: string,
  idempotencyKey: string = randomUUID()
): Promise<void> {
  await applyCreditTransaction(userId, amount, reason, null, idempotencyKey);
}
