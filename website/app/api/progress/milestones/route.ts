import { getServerSupabase } from "@/lib/supabaseServer";
import { getCompletedCourses } from "@/lib/progressAggregation";
import type { MilestoneStatus } from "@/types/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [completedCourses, { data: completedMockAttempts }, { count: resumeCount }] =
      await Promise.all([
        getCompletedCourses(supabase, user.id),
        supabase
          .from("mock_test_attempts")
          .select("completed_at")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: true })
          .limit(1),
        supabase
          .from("resume_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

    const milestones: MilestoneStatus[] = [
      {
        slug: "completed-learning-path",
        title: "Completed Learning Path",
        achieved: completedCourses.length > 0,
        comingSoon: false,
        achievedAt: completedCourses[0]?.completedAt ?? null,
      },
      {
        slug: "completed-mock-test",
        title: "Completed Mock Test",
        achieved: (completedMockAttempts ?? []).length > 0,
        comingSoon: false,
        achievedAt: completedMockAttempts?.[0]?.completed_at ?? null,
      },
      {
        slug: "resume-created",
        title: "Resume Created",
        achieved: (resumeCount ?? 0) > 0,
        comingSoon: false,
        achievedAt: null,
      },
      {
        slug: "interview-ready",
        title: "Interview Ready",
        achieved: false,
        comingSoon: true,
        achievedAt: null,
      },
    ];

    return Response.json({ success: true, milestones });
  } catch (error) {
    console.error("Progress milestones error:", error);

    return Response.json(
      { success: false, message: "Failed to load milestones." },
      { status: 500 }
    );
  }
}
