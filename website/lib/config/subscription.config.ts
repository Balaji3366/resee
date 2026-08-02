/**
 * TS-side mirror of the subscription_plans seed data
 * (supabase/migrations/0012b_ai_architecture_seed.sql). Single source of
 * truth for code that needs plan slugs/credit amounts without a database
 * round trip (e.g. UI copy, future feature-gating checks). The database
 * row remains authoritative for a user's actual plan/balance — this is
 * descriptive, not a second source of truth for live state.
 */
export const subscriptionConfig = {
  plans: {
    free: { slug: "free", name: "Free", monthlyCredits: 15 },
    pro: { slug: "pro", name: "Pro", monthlyCredits: 300 },
    enterprise: { slug: "enterprise", name: "Enterprise", monthlyCredits: null },
  },
} as const;

export type SubscriptionPlanSlug = keyof typeof subscriptionConfig.plans;
