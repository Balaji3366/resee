import { getServerSupabase } from "@/lib/supabaseServer";
import type { ResumeStatus } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const status: ResumeStatus | undefined = body?.status;

    if (status !== "active" && status !== "archived") {
      return Response.json(
        { success: false, message: "status must be 'active' or 'archived'." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("resumes")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Resume status update error:", error);

    return Response.json(
      { success: false, message: "Failed to update resume status." },
      { status: 500 }
    );
  }
}
