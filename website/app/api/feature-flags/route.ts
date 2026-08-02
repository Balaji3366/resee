import { getServerSupabase } from "@/lib/supabaseServer";
import { getFeatureFlags } from "@/lib/ai/featureFlags";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const flags = await getFeatureFlags();

    return Response.json({ success: true, flags });
  } catch (error) {
    console.error("Feature flags fetch error:", error);

    return Response.json(
      { success: false, message: "Failed to load feature flags." },
      { status: 500 }
    );
  }
}
