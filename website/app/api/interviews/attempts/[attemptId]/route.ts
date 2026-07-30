import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();
    const questionId: string | undefined = body?.questionId;
    const answer: string = body?.answer ?? "";

    if (!questionId) {
      return Response.json({ success: false, message: "questionId is required." }, { status: 400 });
    }

    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: attempt } = await supabase
      .from("interview_attempts")
      .select("id, status, answers")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!attempt) {
      return Response.json({ success: false, message: "Attempt not found." }, { status: 404 });
    }

    if (attempt.status !== "in_progress") {
      return Response.json(
        { success: false, message: "This attempt is already completed." },
        { status: 400 }
      );
    }

    const nextAnswers = {
      ...(attempt.answers as Record<string, string>),
      [questionId]: answer,
    };

    const { error: updateError } = await supabase
      .from("interview_attempts")
      .update({ answers: nextAnswers })
      .eq("id", attemptId);

    if (updateError) throw updateError;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Interview attempt autosave error:", error);

    return Response.json({ success: false, message: "Failed to save answer." }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from("interview_attempts")
      .delete()
      .eq("id", attemptId)
      .eq("user_id", user.id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Interview attempt delete error:", error);

    return Response.json({ success: false, message: "Failed to delete interview." }, { status: 500 });
  }
}
