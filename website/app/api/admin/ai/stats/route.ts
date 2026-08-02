import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminAIStats, AdminTrendPoint } from "@/types/admin";

export const dynamic = "force-dynamic";

function toDateString(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

const TREND_WINDOW_DAYS = 30;

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const today = toDateString(new Date().toISOString());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const windowStart = new Date();
    windowStart.setUTCDate(windowStart.getUTCDate() - TREND_WINDOW_DAYS);

    const [
      { count: totalRequests },
      { count: requestsToday },
      { count: requestsThisWeek },
      { data: windowRows },
      { data: creditTransactions },
      { data: subscriptions },
    ] = await Promise.all([
      supabaseAdmin.from("ai_requests").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("ai_requests")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00.000Z`),
      supabaseAdmin
        .from("ai_requests")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString()),
      supabaseAdmin
        .from("ai_requests")
        .select("feature, status, total_tokens, latency_ms, created_at")
        .gte("created_at", windowStart.toISOString()),
      supabaseAdmin.from("ai_credit_transactions").select("amount"),
      supabaseAdmin.from("user_subscriptions").select("plan_slug"),
    ]);

    const rows = windowRows ?? [];

    const statusBreakdown = { success: 0, error: 0, rate_limited: 0, cached: 0 };
    const featureCounts = new Map<string, number>();
    const requestsByDay = new Map<string, number>();
    const errorsByDay = new Map<string, number>();
    let totalTokens = 0;
    let latencySum = 0;
    let latencyCount = 0;

    for (const row of rows) {
      const status = row.status as keyof typeof statusBreakdown;
      if (status in statusBreakdown) statusBreakdown[status] += 1;

      featureCounts.set(row.feature, (featureCounts.get(row.feature) ?? 0) + 1);

      const day = toDateString(row.created_at);
      requestsByDay.set(day, (requestsByDay.get(day) ?? 0) + 1);
      if (status === "error") errorsByDay.set(day, (errorsByDay.get(day) ?? 0) + 1);

      if (typeof row.total_tokens === "number") totalTokens += row.total_tokens;
      if (typeof row.latency_ms === "number") {
        latencySum += row.latency_ms;
        latencyCount += 1;
      }
    }

    const requestsTrend: AdminTrendPoint[] = Array.from(requestsByDay.entries())
      .map(([periodStart, count]) => ({ periodStart, count }))
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));

    const errorTrend: AdminTrendPoint[] = Array.from(errorsByDay.entries())
      .map(([periodStart, count]) => ({ periodStart, count }))
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));

    const requestsByFeature = Array.from(featureCounts.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count);

    let creditsGranted = 0;
    let creditsSpent = 0;
    for (const tx of creditTransactions ?? []) {
      if (tx.amount > 0) creditsGranted += tx.amount;
      else creditsSpent += Math.abs(tx.amount);
    }

    const planCounts = new Map<string, number>();
    for (const sub of subscriptions ?? []) {
      planCounts.set(sub.plan_slug, (planCounts.get(sub.plan_slug) ?? 0) + 1);
    }
    const usersByPlan = Array.from(planCounts.entries()).map(([plan, count]) => ({ plan, count }));

    const stats: AdminAIStats = {
      totalRequests: totalRequests ?? 0,
      requestsToday: requestsToday ?? 0,
      requestsThisWeek: requestsThisWeek ?? 0,
      statusBreakdown,
      totalTokens,
      avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : null,
      requestsByFeature,
      requestsTrend,
      errorTrend,
      creditsGranted,
      creditsSpent,
      usersByPlan,
    };

    return Response.json({ success: true, stats });
  } catch (error) {
    console.error("Admin AI stats error:", error);

    return Response.json({ success: false, message: "Failed to load AI stats." }, { status: 500 });
  }
}
