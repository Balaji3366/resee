import { getServerSupabase } from "@/lib/supabaseServer";
import type { ApplicationStatus } from "@/types/jobs";

export const dynamic = "force-dynamic";

const VALID_STATUSES: ApplicationStatus[] = [
  "applied",
  "interview_scheduled",
  "offer_received",
  "rejected",
  "archived",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const status: ApplicationStatus | undefined = body?.status;

    if (!status || !VALID_STATUSES.includes(status)) {
      return Response.json({ success: false, message: "A valid status is required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("job_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return Response.json({ success: false, message: "Application not found." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update application status error:", error);

    return Response.json(
      { success: false, message: "Failed to update application status." },
      { status: 500 }
    );
  }
}
