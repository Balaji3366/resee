import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminCategory } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("learning_categories")
      .select("id, slug, name, icon, sort_order")
      .order("sort_order");

    if (error) throw error;

    const categories: AdminCategory[] = (data ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      sortOrder: c.sort_order,
    }));

    return Response.json({ success: true, categories });
  } catch (error) {
    console.error("Admin categories list error:", error);

    return Response.json(
      { success: false, message: "Failed to load categories." },
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
      .from("learning_categories")
      .insert({ slug, name, icon, sort_order: sortOrder ?? 0 })
      .select("id, slug, name, icon, sort_order")
      .single();

    if (error) throw error;

    const category: AdminCategory = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      icon: data.icon,
      sortOrder: data.sort_order,
    };

    return Response.json({ success: true, category });
  } catch (error) {
    console.error("Admin category create error:", error);

    return Response.json(
      { success: false, message: "Failed to create category." },
      { status: 500 }
    );
  }
}
