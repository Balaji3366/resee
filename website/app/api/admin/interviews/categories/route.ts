import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminInterviewCategory } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("interview_categories")
      .select("id, slug, name, icon, description, is_available, sort_order")
      .order("sort_order");

    if (error) throw error;

    const categories: AdminInterviewCategory[] = (data ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      description: c.description,
      isAvailable: c.is_available,
      sortOrder: c.sort_order,
    }));

    return Response.json({ success: true, categories });
  } catch (error) {
    console.error("Admin interview categories list error:", error);

    return Response.json(
      { success: false, message: "Failed to load interview categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, name, icon, description, sortOrder } = body ?? {};

    if (!slug || !name || !icon || !description) {
      return Response.json(
        { success: false, message: "slug, name, icon, and description are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("interview_categories")
      .insert({ slug, name, icon, description, sort_order: sortOrder ?? 0, is_available: true })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, categoryId: data.id });
  } catch (error) {
    console.error("Admin interview category create error:", error);

    return Response.json(
      { success: false, message: "Failed to create interview category." },
      { status: 500 }
    );
  }
}
