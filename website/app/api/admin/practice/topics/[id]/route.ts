import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type {
  AdminPracticeCategory,
  AdminPracticeQuestionDetail,
  AdminPracticeTopicDetail,
} from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data: topic, error } = await supabaseAdmin
      .from("practice_topics")
      .select(
        `
        id, slug, title, description, difficulty, icon, is_available, estimated_minutes,
        category:practice_categories(id, slug, name, icon)
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!topic) {
      return Response.json({ success: false, message: "Topic not found." }, { status: 404 });
    }

    const { data: questionRows } = await supabaseAdmin
      .from("practice_questions")
      .select("id, question, question_type, options, correct_option_ids, explanation, sort_order")
      .eq("topic_id", id)
      .order("sort_order");

    const questions: AdminPracticeQuestionDetail[] = (questionRows ?? []).map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.question_type,
      options: q.options,
      correctOptionIds: q.correct_option_ids,
      explanation: q.explanation,
      sortOrder: q.sort_order,
    }));

    const detail: AdminPracticeTopicDetail = {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty,
      icon: topic.icon,
      isAvailable: topic.is_available,
      estimatedMinutes: topic.estimated_minutes,
      category: (topic.category as unknown as AdminPracticeCategory) ?? null,
      questions,
    };

    return Response.json({ success: true, topic: detail });
  } catch (error) {
    console.error("Admin practice topic detail error:", error);

    return Response.json({ success: false, message: "Failed to load topic." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.difficulty === "string") updates.difficulty = body.difficulty;
    if (typeof body.icon === "string") updates.icon = body.icon;
    if (typeof body.categoryId !== "undefined") updates.category_id = body.categoryId || null;
    if (typeof body.estimatedMinutes === "number")
      updates.estimated_minutes = body.estimatedMinutes;
    if (typeof body.isAvailable === "boolean") updates.is_available = body.isAvailable;

    const { error } = await supabaseAdmin.from("practice_topics").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin practice topic update error:", error);

    return Response.json({ success: false, message: "Failed to update topic." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest(["super_admin", "admin"]);
    if (auth.error) return auth.error;

    const { error } = await supabaseAdmin.from("practice_topics").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin practice topic delete error:", error);

    return Response.json({ success: false, message: "Failed to delete topic." }, { status: 500 });
  }
}
