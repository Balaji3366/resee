import { getServerSupabase } from "@/lib/supabaseServer";
import { maybeSnapshotVersion } from "@/lib/resumeVersioning";
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
      .select("id, title, template_slug, status, content, updated_at, created_at")
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
      status: data.status,
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
    const title: string | undefined = body?.title;
    const templateSlug: string | undefined = body?.templateSlug;
    const forceSnapshot: boolean = Boolean(body?.forceSnapshot);

    const updates: Record<string, unknown> = {};
    if (content !== undefined) updates.content = content;
    if (title !== undefined) updates.title = title;
    if (templateSlug !== undefined) updates.template_slug = templateSlug;

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { success: false, message: "No fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("resumes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, content")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    if (content !== undefined) {
      await maybeSnapshotVersion(supabase, id, content, forceSnapshot);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Resume autosave error:", error);

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
