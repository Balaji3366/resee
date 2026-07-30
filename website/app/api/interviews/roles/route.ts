import { getServerSupabase } from "@/lib/supabaseServer";
import type { InterviewRole } from "@/types/interview";

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

    const { data, error } = await supabase
      .from("interview_roles")
      .select("id, slug, name, icon")
      .order("sort_order");

    if (error) throw error;

    const roles: InterviewRole[] = (data ?? []) as InterviewRole[];

    return Response.json({ success: true, roles });
  } catch (error) {
    console.error("Interview roles error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview roles." },
      { status: 500 }
    );
  }
}
