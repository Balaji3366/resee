import { getServerSupabase } from "@/lib/supabaseServer";
import { maybeSnapshotVersion } from "@/lib/resumeVersioning";
import { selectTemplate } from "@/lib/resumeTemplateSelection";
import type { ResumeContent, ResumeDetail } from "@/types/resume-builder";

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

    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, template_slug, content, updated_at, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    const resume: ResumeDetail = {
      id: data.id,
      title: data.title,
      templateSlug: data.template_slug,
      content: data.content,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
    };

    return Response.json({ success: true, resume });
  } catch (error) {
    console.error("Resume detail error:", error);

    return Response.json(
      { success: false, message: "Failed to load resume." },
      { status: 500 }
    );
  }
}

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
    const content: ResumeContent | undefined = body?.content;

    if (!content) {
      return Response.json({ success: false, message: "content is required." }, { status: 400 });
    }

    const templateSlug = selectTemplate(content.userType);
    const title = content.personalInfo?.fullName
      ? `${content.personalInfo.fullName} Resume`
      : "My Resume";

    const { data, error } = await supabase
      .from("resumes")
      .update({ content, template_slug: templateSlug, title })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    await maybeSnapshotVersion(supabase, id, content, true);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Resume update error:", error);

    return Response.json(
      { success: false, message: "Failed to save resume." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Resume delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete resume." },
      { status: 500 }
    );
  }
}
