import { getServerSupabase } from "@/lib/supabaseServer";
import type { ContinueInterviewItem } from "@/types/interview";

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
      .select("id, total_questions, answers, started_at, set:interview_sets(slug, title)")
      .eq("user_id", user.id)
      .eq("status", "in_progress");

    const items: ContinueInterviewItem[] = [];

    for (const attempt of attempts ?? []) {
      const set = attempt.set as unknown as { slug: string; title: string } | null;
      if (!set) continue;

      const answers = (attempt.answers as Record<string, string>) ?? {};
      const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;

      items.push({
        attemptId: attempt.id,
        slug: set.slug,
        title: set.title,
        totalQuestions: attempt.total_questions,
        questionsRemaining: Math.max(0, attempt.total_questions - answeredCount),
        progressPercent:
          attempt.total_questions > 0 ? Math.round((answeredCount / attempt.total_questions) * 100) : 0,
        startedAt: attempt.started_at,
      });
    }

    items.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return Response.json({ success: true, items });
  } catch (error) {
    console.error("Continue interviews error:", error);

    return Response.json(
      { success: false, message: "Failed to load continue-interview data." },
      { status: 500 }
    );
  }
}
