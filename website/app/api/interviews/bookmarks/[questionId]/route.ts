import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("interview_question_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", questionId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Interview bookmark delete error:", error);

    return Response.json(
      { success: false, message: "Failed to remove bookmark." },
      { status: 500 }
    );
  }
}
