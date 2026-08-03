import { getServerSupabase } from "@/lib/supabaseServer";
import { generatePostSessionEvaluation } from "@/lib/interviewEvaluation";
import { aiErrorStatus } from "@/lib/ai/errorHandler";

export const dynamic = "force-dynamic";

/**
 * Manual retry for the automatic Post-Session Evaluation — used when
 * the automatic attempt at completion time failed (e.g. insufficient
 * credits) and the user wants to try again. Idempotent: if an
 * evaluation already exists for this attempt, generatePostSessionEvaluation
 * returns it as-is rather than generating (and charging for) a second one.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const result = await generatePostSessionEvaluation(supabase, user.id, attemptId);

    return Response.json(result, {
      status: result.success ? 200 : aiErrorStatus(result.error.code),
    });
  } catch (error) {
    console.error("Manual interview evaluation error:", error);

    return Response.json(
      { success: false, message: "Failed to generate interview evaluation." },
      { status: 500 }
    );
  }
}
