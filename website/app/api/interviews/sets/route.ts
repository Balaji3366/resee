import { getServerSupabase } from "@/lib/supabaseServer";
import type { InterviewCategory, InterviewRole, InterviewSetSummary } from "@/types/interview";

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

    const { data: sets, error: setsError } = await supabase
      .from("interview_sets")
      .select(
        `
        id, slug, title, description, difficulty, is_available, estimated_minutes,
        category:interview_categories(id, slug, name, icon, description, is_available),
        role:interview_roles(id, slug, name, icon),
        interview_questions(id)
      `
      )
      .order("sort_order");

    if (setsError) throw setsError;

    const setIds = (sets ?? []).map((s) => s.id);

    const { data: attempts } = setIds.length
      ? await supabase
          .from("interview_attempts")
          .select("id, interview_set_id, status, completed_at")
          .eq("user_id", user.id)
          .in("interview_set_id", setIds)
      : { data: [] };

    const completedCountBySet = new Map<string, number>();
    const lastCompletedBySet = new Map<string, string>();
    const inProgressBySet = new Map<string, string>();

    for (const attempt of attempts ?? []) {
      if (attempt.status === "completed") {
        completedCountBySet.set(
          attempt.interview_set_id,
          (completedCountBySet.get(attempt.interview_set_id) ?? 0) + 1
        );

        if (attempt.completed_at) {
          const existing = lastCompletedBySet.get(attempt.interview_set_id);
          if (!existing || attempt.completed_at > existing) {
            lastCompletedBySet.set(attempt.interview_set_id, attempt.completed_at);
          }
        }
      } else if (attempt.status === "in_progress") {
        inProgressBySet.set(attempt.interview_set_id, attempt.id);
      }
    }

    const summaries: InterviewSetSummary[] = (sets ?? []).map((set) => ({
      id: set.id,
      slug: set.slug,
      title: set.title,
      description: set.description,
      category: set.category as unknown as InterviewCategory,
      role: set.role as unknown as InterviewRole,
      difficulty: set.difficulty,
      estimatedMinutes: set.estimated_minutes,
      isAvailable: set.is_available,
      questionCount: (set.interview_questions ?? []).length,
      completedCount: completedCountBySet.get(set.id) ?? 0,
      inProgressAttemptId: inProgressBySet.get(set.id) ?? null,
      lastCompletedAt: lastCompletedBySet.get(set.id) ?? null,
    }));

    return Response.json({ success: true, sets: summaries });
  } catch (error) {
    console.error("Interview sets error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview sets." },
      { status: 500 }
    );
  }
}
