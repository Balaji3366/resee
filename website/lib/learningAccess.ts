import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Loads a course's modules (ordered) plus which of them the user has
 * already passed the quiz for, so callers can compute unlock state
 * without duplicating the query/order-by logic in every route.
 */
export async function getModuleUnlockContext(
  supabase: SupabaseClient,
  courseId: string,
  userId: string
) {
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, sort_order")
    .eq("course_id", courseId)
    .order("sort_order");

  const moduleIds = (modules ?? []).map((m) => m.id);

  const { data: passedRows } = moduleIds.length
    ? await supabase
        .from("module_progress")
        .select("module_id")
        .eq("user_id", userId)
        .eq("quiz_passed", true)
        .in("module_id", moduleIds)
    : { data: [] };

  const passedModuleIds = new Set((passedRows ?? []).map((r) => r.module_id));

  return {
    modules: (modules ?? []) as { id: string; sort_order: number }[],
    passedModuleIds,
  };
}

export function isModuleUnlocked(
  moduleId: string,
  modules: { id: string }[],
  passedModuleIds: Set<string>,
  isEnrolled: boolean
): boolean {
  if (!isEnrolled) return false;

  const index = modules.findIndex((m) => m.id === moduleId);
  if (index === -1) return false;
  if (index === 0) return true;

  return passedModuleIds.has(modules[index - 1].id);
}
