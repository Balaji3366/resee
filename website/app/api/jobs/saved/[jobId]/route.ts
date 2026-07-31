import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", user.id)
      .eq("job_id", jobId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Unsave job error:", error);

    return Response.json({ success: false, message: "Failed to unsave job." }, { status: 500 });
  }
}
