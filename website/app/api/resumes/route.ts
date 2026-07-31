import { getServerSupabase } from "@/lib/supabaseServer";
import { selectTemplate } from "@/lib/resumeTemplateSelection";
import type { ResumeContent, ResumeSummary } from "@/types/resume-builder";

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
      .from("resumes")
      .select("id, title, template_slug, updated_at, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const resumes: ResumeSummary[] = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      templateSlug: r.template_slug,
      updatedAt: r.updated_at,
      createdAt: r.created_at,
    }));

    return Response.json({ success: true, resumes });
  } catch (error) {
    console.error("Resumes list error:", error);

    return Response.json(
      { success: false, message: "Failed to load resumes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      .insert({
        user_id: user.id,
        template_slug: templateSlug,
        title,
        content,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, resumeId: data.id });
  } catch (error) {
    console.error("Resume create error:", error);

    return Response.json(
      { success: false, message: "Failed to create resume." },
      { status: 500 }
    );
  }
}
