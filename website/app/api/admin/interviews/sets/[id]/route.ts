import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type {
  AdminInterviewCategory,
  AdminInterviewQuestionDetail,
  AdminInterviewRole,
  AdminInterviewSetDetail,
} from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data: set, error } = await supabaseAdmin
      .from("interview_sets")
      .select(
        `
        id, slug, title, description, experience_level, is_available, estimated_minutes,
        category:interview_categories(id, slug, name, icon, description, is_available, sort_order),
        role:interview_roles(id, slug, name, icon, sort_order)
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!set) {
      return Response.json(
        { success: false, message: "Interview set not found." },
        { status: 404 }
      );
    }

    const { data: questionRows } = await supabaseAdmin
      .from("interview_questions")
      .select("id, question, question_type, sort_order")
      .eq("interview_set_id", id)
      .order("sort_order");

    const questions: AdminInterviewQuestionDetail[] = (questionRows ?? []).map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.question_type,
      sortOrder: q.sort_order,
    }));

    const detail: AdminInterviewSetDetail = {
      id: set.id,
      slug: set.slug,
      title: set.title,
      description: set.description,
      experienceLevel: set.experience_level,
      isAvailable: set.is_available,
      estimatedMinutes: set.estimated_minutes,
      category: (set.category as unknown as AdminInterviewCategory) ?? null,
      role: (set.role as unknown as AdminInterviewRole) ?? null,
      questions,
    };

    return Response.json({ success: true, set: detail });
  } catch (error) {
    console.error("Admin interview set detail error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview set." },
      { status: 500 }
    );
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
    if (typeof body.estimatedMinutes === "number")
      updates.estimated_minutes = body.estimatedMinutes;
    if (typeof body.isAvailable === "boolean") updates.is_available = body.isAvailable;

    const { error } = await supabaseAdmin.from("interview_sets").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin interview set update error:", error);

    return Response.json(
      { success: false, message: "Failed to update interview set." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest(["super_admin", "admin"]);
    if (auth.error) return auth.error;

    const { error } = await supabaseAdmin.from("interview_sets").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin interview set delete error:", error);

    return Response.json(
      { success: false, message: "Failed to delete interview set." },
      { status: 500 }
    );
  }
}
