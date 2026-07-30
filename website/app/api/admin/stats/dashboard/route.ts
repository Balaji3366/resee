import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminDashboardStats, AdminTrendPoint } from "@/types/admin";

export const dynamic = "force-dynamic";

function toWeekStart(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

function toDateString(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    // perPage caps this at the most recent 1000 users for the growth
    // chart specifically — `total` below is still the exact platform-wide
    // count regardless of this cap.
    const { data: userPage, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (usersError) throw usersError;

    const totalUsers = userPage.total;
    const today = toDateString(new Date().toISOString());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const sevenDaysAgoStr = toDateString(sevenDaysAgo.toISOString());

    const [
      { count: activeUsers },
      { count: dailyActiveUsers },
      { data: courses },
      { count: totalEnrollments },
      { data: quizAttempts },
    ] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("last_activity_date", sevenDaysAgoStr),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("last_activity_date", today),
      supabaseAdmin.from("courses").select("id, status"),
      supabaseAdmin.from("enrollments").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("quiz_attempts").select("passed, attempted_at"),
    ]);

    const learningPathsTotal = (courses ?? []).length;
    const learningPathsPublished = (courses ?? []).filter((c) => c.status === "published").length;
    const quizCompletions = (quizAttempts ?? []).filter((a) => a.passed).length;

    const userGrowthByWeek = new Map<string, number>();
    for (const u of userPage.users) {
      if (!u.created_at) continue;
      const week = toWeekStart(u.created_at);
      userGrowthByWeek.set(week, (userGrowthByWeek.get(week) ?? 0) + 1);
    }
    const userGrowth: AdminTrendPoint[] = Array.from(userGrowthByWeek.entries())
      .map(([periodStart, count]) => ({ periodStart, count }))
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));

    const { data: lessonCompletions } = await supabaseAdmin
      .from("lesson_progress")
      .select("completed_at");

    const learningActivityByWeek = new Map<string, number>();
    for (const row of lessonCompletions ?? []) {
      const week = toWeekStart(row.completed_at);
      learningActivityByWeek.set(week, (learningActivityByWeek.get(week) ?? 0) + 1);
    }
    for (const row of quizAttempts ?? []) {
      const week = toWeekStart(row.attempted_at);
      learningActivityByWeek.set(week, (learningActivityByWeek.get(week) ?? 0) + 1);
    }
    const learningActivity: AdminTrendPoint[] = Array.from(learningActivityByWeek.entries())
      .map(([periodStart, count]) => ({ periodStart, count }))
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));

    const quizRateByWeek = new Map<string, { passed: number; failed: number }>();
    for (const attempt of quizAttempts ?? []) {
      const week = toWeekStart(attempt.attempted_at);
      const bucket = quizRateByWeek.get(week) ?? { passed: 0, failed: 0 };
      if (attempt.passed) bucket.passed += 1;
      else bucket.failed += 1;
      quizRateByWeek.set(week, bucket);
    }
    const quizCompletionRate = Array.from(quizRateByWeek.entries())
      .map(([periodStart, b]) => ({ periodStart, passed: b.passed, failed: b.failed }))
      .sort((a, b) => a.periodStart.localeCompare(b.periodStart));

    const stats: AdminDashboardStats = {
      totalUsers,
      activeUsers: activeUsers ?? 0,
      dailyActiveUsers: dailyActiveUsers ?? 0,
      learningPathsPublished,
      learningPathsTotal,
      totalEnrollments: totalEnrollments ?? 0,
      quizCompletions,
      userGrowth,
      learningActivity,
      quizCompletionRate,
    };

    return Response.json({ success: true, stats });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);

    return Response.json(
      { success: false, message: "Failed to load dashboard stats." },
      { status: 500 }
    );
  }
}
