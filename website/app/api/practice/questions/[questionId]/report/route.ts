import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const body = await request.json().catch(() => ({}));
    const reason: string | null = body?.reason ?? null;

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

    const { error } = await supabase.from("practice_question_reports").insert({
      user_id: user.id,
      question_id: questionId,
      reason,
    });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Question report error:", error);

    return Response.json(
      { success: false, message: "Failed to report question." },
      { status: 500 }
    );
  }
}
