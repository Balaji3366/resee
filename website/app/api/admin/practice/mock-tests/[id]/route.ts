import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminMockTestDetail, AdminMockTestQuestionLink } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data: test, error } = await supabaseAdmin
      .from("mock_tests")
      .select("id, slug, title, description, difficulty, duration_minutes, is_available")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!test) {
      return Response.json({ success: false, message: "Mock test not found." }, { status: 404 });
    }

    const { data: linkRows } = await supabaseAdmin
      .from("mock_test_questions")
      .select(
        `
        id, sort_order,
        practice_questions(id, question, topic:practice_topics(title))
      `
      )
      .eq("mock_test_id", id)
      .order("sort_order");

    type RawLink = {
      id: string;
      sort_order: number;
      practice_questions: { id: string; question: string; topic: { title: string } | null } | null;
    };

    const questions: AdminMockTestQuestionLink[] = ((linkRows ?? []) as unknown as RawLink[])
      .filter((l) => l.practice_questions)
      .map((l) => ({
        linkId: l.id,
        questionId: l.practice_questions!.id,
        question: l.practice_questions!.question,
        topicTitle: l.practice_questions!.topic?.title ?? "—",
        sortOrder: l.sort_order,
      }));

    const detail: AdminMockTestDetail = {
      id: test.id,
      slug: test.slug,
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      durationMinutes: test.duration_minutes,
      isAvailable: test.is_available,
      questions,
    };

    return Response.json({ success: true, test: detail });
  } catch (error) {
    console.error("Admin mock test detail error:", error);

    return Response.json({ success: false, message: "Failed to load mock test." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.difficulty === "string") updates.difficulty = body.difficulty;
    if (typeof body.durationMinutes === "number") updates.duration_minutes = body.durationMinutes;
    if (typeof body.isAvailable === "boolean") updates.is_available = body.isAvailable;

    const { error } = await supabaseAdmin.from("mock_tests").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin mock test update error:", error);

    return Response.json(
      { success: false, message: "Failed to update mock test." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest(["super_admin", "admin"]);
    if (auth.error) return auth.error;

    const { error } = await supabaseAdmin.from("mock_tests").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin mock test delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete mock test." },
      { status: 500 }
    );
  }
}
