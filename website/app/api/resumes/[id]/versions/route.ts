import { getServerSupabase } from "@/lib/supabaseServer";
import type { ResumeVersionSummary } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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
      .from("resume_versions")
      .select("id, version_number, created_at")
      .eq("resume_id", id)
      .order("version_number", { ascending: false })
      .limit(50);

    if (error) throw error;

    const versions: ResumeVersionSummary[] = (data ?? []).map((v) => ({
      id: v.id,
      versionNumber: v.version_number,
      createdAt: v.created_at,
    }));

    return Response.json({ success: true, versions });
  } catch (error) {
    console.error("Resume versions list error:", error);

    return Response.json(
      { success: false, message: "Failed to load version history." },
      { status: 500 }
    );
  }
}
