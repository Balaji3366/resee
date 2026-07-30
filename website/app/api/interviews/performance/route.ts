import { getServerSupabase } from "@/lib/supabaseServer";
import type { InterviewPerformanceData } from "@/types/interview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [{ data: attempts }, { data: profile }] = await Promise.all([
      supabase
        .from("interview_attempts")
        .select("time_taken_seconds, set:interview_sets(category_id, role_id)")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("profiles")
        .select("current_streak")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    const rows = attempts ?? [];

    const totalPracticeSeconds = rows.reduce((sum, a) => sum + (a.time_taken_seconds ?? 0), 0);

    const categoryIds = new Set<string>();
    const roleIds = new Set<string>();

    for (const row of rows) {
      const set = row.set as unknown as { category_id: string; role_id: string } | null;
      if (set?.category_id) categoryIds.add(set.category_id);
      if (set?.role_id) roleIds.add(set.role_id);
    }

    const data: InterviewPerformanceData = {
      interviewsCompleted: rows.length,
      totalPracticeSeconds,
      currentStreak: profile?.current_streak ?? 0,
      categoriesAttempted: categoryIds.size,
      rolesPractised: roleIds.size,
    };

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Interview performance error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview performance." },
      { status: 500 }
    );
  }
}
