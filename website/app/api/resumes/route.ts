import { getServerSupabase } from "@/lib/supabaseServer";
import { emptyResumeContent } from "@/types/resume-builder";
import type { ResumeSummary, ResumeStatus } from "@/types/resume-builder";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const status = (new URL(request.url).searchParams.get("status") as ResumeStatus) || "active";

    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, template_slug, status, updated_at, created_at")
      .eq("user_id", user.id)
      .eq("status", status)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const resumes: ResumeSummary[] = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      templateSlug: r.template_slug,
      status: r.status,
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
    const templateSlug: string | undefined = body?.templateSlug;
    const title: string | undefined = body?.title;

    if (!templateSlug) {
      return Response.json(
        { success: false, message: "templateSlug is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        template_slug: templateSlug,
        title: title || "Untitled Resume",
        content: emptyResumeContent(),
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
