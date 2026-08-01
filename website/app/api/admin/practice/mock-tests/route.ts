import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminMockTestSummary } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("mock_tests")
      .select(
        "id, slug, title, difficulty, duration_minutes, is_available, mock_test_questions(id)"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const tests: AdminMockTestSummary[] = (data ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      difficulty: t.difficulty,
      isAvailable: t.is_available,
      durationMinutes: t.duration_minutes,
      questionCount: (t.mock_test_questions ?? []).length,
    }));

    return Response.json({ success: true, tests });
  } catch (error) {
    console.error("Admin mock tests list error:", error);

    return Response.json(
      { success: false, message: "Failed to load mock tests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, title, description, difficulty, durationMinutes } = body ?? {};

    if (!slug || !title || !description || !difficulty || !durationMinutes) {
      return Response.json(
        {
          success: false,
          message: "slug, title, description, difficulty, and durationMinutes are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("mock_tests")
      .insert({
        slug,
        title,
        description,
        difficulty,
        duration_minutes: durationMinutes,
        is_available: false,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, testId: data.id });
  } catch (error) {
    console.error("Admin mock test create error:", error);

    return Response.json(
      { success: false, message: "Failed to create mock test." },
      { status: 500 }
    );
  }
}
