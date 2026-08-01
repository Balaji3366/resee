import { getServerSupabase } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/adminAuth";
import { jsonOk, jsonError } from "@/lib/http/responses";
import { unauthorized } from "@/lib/errors";

export const dynamic = "force-dynamic";

/**
 * The one new route in Sprint 3/4's shared-platform slice — purely
 * exposes the existing server-side requireAdmin() (lib/adminAuth.ts) to
 * the client, so usePermissions() has something real to call. No new
 * authorization logic is introduced here.
 */
export async function GET() {
  const supabase = await getServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError(unauthorized());
  }

  const role = await requireAdmin(user.id);

  return jsonOk({ role, isAdmin: role !== null });
}
