import { supabaseAdmin } from "@/lib/supabase-admin";
import { getServerSupabase } from "@/lib/supabaseServer";
import { logAdminAction } from "@/lib/logging/auditLogger";

export type AdminRole = "super_admin" | "admin" | "content_manager";

const ALL_ROLES: AdminRole[] = ["super_admin", "admin", "content_manager"];

/**
 * Defense-in-depth check called at the top of every /api/admin/** route,
 * independent of proxy.ts's optimistic gate. Always reads via
 * supabaseAdmin (service role), not the caller's session-scoped client.
 */
export async function requireAdmin(
  userId: string,
  allowedRoles: AdminRole[] = ALL_ROLES
): Promise<AdminRole | null> {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const role = data.role as AdminRole;
  if (!allowedRoles.includes(role)) return null;

  return role;
}

type AuthorizeResult =
  | { error: Response; userId?: undefined; role?: undefined }
  | { error?: undefined; userId: string; role: AdminRole };

/**
 * Shared session+role check for /api/admin/** route handlers. On failure,
 * returns a ready-to-return Response (401/403); on success, returns the
 * caller's userId and admin role. Callers should do:
 *
 *   const auth = await authorizeAdminRequest();
 *   if (auth.error) return auth.error;
 *   // use auth.userId / auth.role
 */
export async function authorizeAdminRequest(allowedRoles?: AdminRole[]): Promise<AuthorizeResult> {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: Response.json({ success: false, message: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = await requireAdmin(user.id, allowedRoles);

  if (!role) {
    return {
      error: Response.json({ success: false, message: "Forbidden" }, { status: 403 }),
    };
  }

  // Coarse-grained audit trail: who accessed a privileged endpoint, and
  // when. Does not block the request — a logging failure here must never
  // fail an otherwise-successful admin action.
  void logAdminAction({ adminUserId: user.id, action: "admin_request_authorized" });

  return { userId: user.id, role };
}
