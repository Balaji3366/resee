import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (resumeError) throw resumeError;
    if (!resume) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("resume_analyses")
      .select("id, feature, result, created_at")
      .eq("resume_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const analyses = (data ?? []).map((row) => ({
      id: row.id,
      feature: row.feature,
      result: row.result,
      createdAt: row.created_at,
    }));

    return Response.json({ success: true, analyses });
  } catch (error) {
    console.error("Resume analysis history error:", error);

    return Response.json(
      { success: false, message: "Failed to load analysis history." },
      { status: 500 }
    );
  }
}
