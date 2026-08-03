import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: attempt } = await supabase
      .from("interview_attempts")
      .select("id")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!attempt) {
      return Response.json({ success: false, message: "Attempt not found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("interview_analyses")
      .select("id, feature, question_id, result, created_at")
      .eq("attempt_id", attemptId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const analyses = (data ?? []).map((row) => ({
      id: row.id,
      feature: row.feature,
      questionId: row.question_id,
      result: row.result,
      createdAt: row.created_at,
    }));

    return Response.json({ success: true, analyses });
  } catch (error) {
    console.error("Interview analysis history error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview analysis history." },
      { status: 500 }
    );
  }
}
