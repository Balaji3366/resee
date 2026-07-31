import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AIFeature, SubscriptionPlanSlug, UserSubscription } from "@/types/ai";

const DEFAULT_PLAN: SubscriptionPlanSlug = "free";

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
 * Lazy default — no row means Free plan, matching the same
 * no-row-means-default pattern already used for job_preferences. A row
 * only gets materialized on first credit-consuming action.
 */
export async function getSubscription(userId: string): Promise<UserSubscription> {
  const { data } = await supabaseAdmin
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return toSubscription(data);

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
  const { data: existing } = await supabaseAdmin
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return toSubscription(existing);

  const virtual = await getSubscription(userId);

  const { data: created } = await supabaseAdmin
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      plan_slug: virtual.planSlug,
      status: virtual.status,
      credits_remaining: virtual.creditsRemaining,
    })
    .select("*")
    .single();

  return toSubscription(created);
}

export async function hasCredits(userId: string, amount: number): Promise<boolean> {
  const subscription = await getSubscription(userId);
  if (subscription.creditsRemaining === null) return true; // unlimited
  return subscription.creditsRemaining >= amount;
}

export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  feature: AIFeature
): Promise<void> {
  const subscription = await ensureSubscriptionRow(userId);

  const newBalance =
    subscription.creditsRemaining === null ? null : subscription.creditsRemaining - amount;

  if (newBalance !== null) {
    await supabaseAdmin
      .from("user_subscriptions")
      .update({ credits_remaining: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  await supabaseAdmin.from("ai_credit_transactions").insert({
    user_id: userId,
    amount: -amount,
    reason,
    feature,
    balance_after: newBalance,
  });
}

export async function grantCredits(userId: string, amount: number, reason: string): Promise<void> {
  const subscription = await ensureSubscriptionRow(userId);

  const newBalance =
    subscription.creditsRemaining === null ? null : subscription.creditsRemaining + amount;

  if (newBalance !== null) {
    await supabaseAdmin
      .from("user_subscriptions")
      .update({ credits_remaining: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  await supabaseAdmin.from("ai_credit_transactions").insert({
    user_id: userId,
    amount,
    reason,
    feature: null,
    balance_after: newBalance,
  });
}
