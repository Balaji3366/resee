import { getServerSupabase } from "@/lib/supabaseServer";
import { issueCertificateIfEligible } from "@/lib/certificates";

export const dynamic = "force-dynamic";

/**
 * Returns the caller's certificate for this course, lazily issuing one
 * if they've just become eligible (e.g. a course with no final exam,
 * where completing the last lesson is the only trigger — there's no
 * exam-attempt route to issue it from in that case).
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id, title")
      .eq("slug", slug)
      .maybeSingle();

    if (!course) {
      return Response.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const certificate = await issueCertificateIfEligible(supabase, user.id, course.id);

    if (!certificate) {
      return Response.json(
        { success: false, message: "You haven't completed this course yet." },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        courseTitle: course.title,
      },
    });
  } catch (error) {
    console.error("Course certificate fetch error:", error);

    return Response.json(
      { success: false, message: "Failed to load certificate." },
      { status: 500 }
    );
  }
}
