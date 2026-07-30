import { getServerSupabase } from "@/lib/supabaseServer";
import type { InterviewHistoryEntry } from "@/types/interview";

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

    const { data: attempts } = await supabase
      .from("interview_attempts")
      .select(
        `
        id, total_questions, completed_questions, time_taken_seconds, completed_at,
        set:interview_sets(slug, title, difficulty, category:interview_categories(name), role:interview_roles(name))
      `
      )
      .eq("user_id", user.id)
      .eq("status", "completed");

    const entries: InterviewHistoryEntry[] = [];

    for (const attempt of attempts ?? []) {
      const set = attempt.set as unknown as {
        slug: string;
        title: string;
        difficulty: InterviewHistoryEntry["difficulty"];
        category: { name: string } | null;
        role: { name: string } | null;
      } | null;

      if (!set || !attempt.completed_at) continue;

      entries.push({
        id: attempt.id,
        slug: set.slug,
        title: set.title,
        categoryName: set.category?.name ?? "",
        roleName: set.role?.name ?? "",
        difficulty: set.difficulty,
        totalQuestions: attempt.total_questions,
        completedQuestions: attempt.completed_questions ?? 0,
        timeTakenSeconds: attempt.time_taken_seconds ?? 0,
        completedAt: attempt.completed_at,
      });
    }

    entries.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return Response.json({ success: true, entries });
  } catch (error) {
    console.error("Interview history error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview history." },
      { status: 500 }
    );
  }
}
