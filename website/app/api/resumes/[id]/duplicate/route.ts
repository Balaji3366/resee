import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(
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

    const { data: original, error: fetchError } = await supabase
      .from("resumes")
      .select("title, template_slug, content")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!original) {
      return Response.json({ success: false, message: "Resume not found." }, { status: 404 });
    }

    const { data: copy, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        template_slug: original.template_slug,
        title: `${original.title} (Copy)`,
        content: original.content,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    return Response.json({ success: true, resumeId: copy.id });
  } catch (error) {
    console.error("Resume duplicate error:", error);

    return Response.json(
      { success: false, message: "Failed to duplicate resume." },
      { status: 500 }
    );
  }
}
