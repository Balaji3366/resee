import { supabaseAdmin } from "@/lib/supabase-admin";
import { logger } from "@/lib/logging/logger";

export interface LogAdminActionParams {
  adminUserId: string;
  action: string;
  targetTable?: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Writes to admin_audit_log (supabase/migrations/0013_platform_foundation.sql).
 * First real consumer is lib/adminAuth.ts's authorizeAdminRequest(), which
 * logs coarse-grained "admin accessed a privileged endpoint" events on
 * every successful role check — centralized in one file rather than
 * requiring every /api/admin/** route to remember to call this. A route
 * that wants a granular before/after diff for a specific mutation can
 * call logAdminAction() directly with that detail; this is the shared
 * primitive, not a forced per-route rewrite.
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  const { error } = await supabaseAdmin.from("admin_audit_log").insert({
    admin_user_id: params.adminUserId,
    action: params.action,
    target_table: params.targetTable ?? null,
    target_id: params.targetId ?? null,
    before: params.before ?? null,
    after: params.after ?? null,
  });

  if (error) {
    logger.error("Admin audit logging failed", { error: error.message });
  }
}
