import { getServerSupabase } from "@/lib/supabaseServer";
import type { InterviewCategory, InterviewRole, InterviewSetSummary } from "@/types/interview";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ setSlug: string }> }
) {
  try {
    const { setSlug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: set } = await supabase
      .from("interview_sets")
      .select(
        `
        id, slug, title, description, difficulty, is_available, estimated_minutes,
        category:interview_categories(id, slug, name, icon, description, is_available),
        role:interview_roles(id, slug, name, icon),
        interview_questions(id)
      `
      )
      .eq("slug", setSlug)
      .maybeSingle();

    if (!set) {
      return Response.json({ success: false, message: "Interview set not found." }, { status: 404 });
    }

    const { data: attempts } = await supabase
      .from("interview_attempts")
      .select("id, status, completed_at")
      .eq("user_id", user.id)
      .eq("interview_set_id", set.id);

    const completed = (attempts ?? []).filter((a) => a.status === "completed");
    const inProgress = (attempts ?? []).find((a) => a.status === "in_progress");

    const lastCompletedAt = completed.length
      ? completed.reduce((latest, a) => (a.completed_at && a.completed_at > latest ? a.completed_at : latest), completed[0].completed_at ?? "")
      : null;

    const summary: InterviewSetSummary = {
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
      completedCount: completed.length,
      inProgressAttemptId: inProgress?.id ?? null,
      lastCompletedAt,
    };

    return Response.json({ success: true, set: summary });
  } catch (error) {
    console.error("Interview set detail error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview set." },
      { status: 500 }
    );
  }
}
