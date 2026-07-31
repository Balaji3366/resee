import { getServerSupabase } from "@/lib/supabaseServer";
import { maybeSnapshotVersion } from "@/lib/resumeVersioning";
import { selectTemplate } from "@/lib/resumeTemplateSelection";
import type { ResumeContent } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params;
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

    const { data: version, error: versionError } = await supabase
      .from("resume_versions")
      .select("content")
      .eq("id", versionId)
      .eq("resume_id", id)
      .maybeSingle();

    if (versionError) throw versionError;

    if (!version) {
      return Response.json({ success: false, message: "Version not found." }, { status: 404 });
    }

    const restoredContent = version.content as ResumeContent;
    const templateSlug = selectTemplate(restoredContent.userType);

    const { error: updateError } = await supabase
      .from("resumes")
      .update({ content: restoredContent, template_slug: templateSlug })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    await maybeSnapshotVersion(supabase, id, version.content, true);

    return Response.json({ success: true, content: version.content });
  } catch (error) {
    console.error("Resume version restore error:", error);

    return Response.json(
      { success: false, message: "Failed to restore version." },
      { status: 500 }
    );
  }
}
