import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminInterviewRole } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("interview_roles")
      .select("id, slug, name, icon, sort_order")
      .order("sort_order");

    if (error) throw error;

    const roles: AdminInterviewRole[] = (data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      icon: r.icon,
      sortOrder: r.sort_order,
    }));

    return Response.json({ success: true, roles });
  } catch (error) {
    console.error("Admin interview roles list error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview roles." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, name, icon, sortOrder } = body ?? {};

    if (!slug || !name || !icon) {
      return Response.json(
        { success: false, message: "slug, name, and icon are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("interview_roles")
      .insert({ slug, name, icon, sort_order: sortOrder ?? 0 })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, roleId: data.id });
  } catch (error) {
    console.error("Admin interview role create error:", error);

    return Response.json(
      { success: false, message: "Failed to create interview role." },
      { status: 500 }
    );
  }
}
