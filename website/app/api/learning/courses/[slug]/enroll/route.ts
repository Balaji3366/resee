import { getServerSupabase } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id, is_available")
      .eq("slug", slug)
      .maybeSingle();

    if (!course) {
      return Response.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }

    if (!course.is_available) {
      return Response.json(
        { success: false, message: "This course isn't available yet." },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("enrollments")
      .upsert(
        { user_id: user.id, course_id: course.id },
        { onConflict: "user_id,course_id", ignoreDuplicates: true }
      );

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Enroll error:", error);

    return Response.json(
      { success: false, message: "Failed to enroll in this course." },
      { status: 500 }
    );
  }
}
