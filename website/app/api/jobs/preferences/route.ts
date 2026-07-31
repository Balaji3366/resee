import { getServerSupabase } from "@/lib/supabaseServer";
import type { JobPreferences } from "@/types/jobs";

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

    const { data } = await supabase
      .from("job_preferences")
      .select("preferred_roles, preferred_locations, preferred_work_mode")
      .eq("user_id", user.id)
      .maybeSingle();

    const preferences: JobPreferences = {
      preferredRoles: data?.preferred_roles ?? [],
      preferredLocations: data?.preferred_locations ?? [],
      preferredWorkMode: data?.preferred_work_mode ?? null,
    };

    return Response.json({ success: true, preferences, hasPreferences: Boolean(data) });
  } catch (error) {
    console.error("Job preferences fetch error:", error);

    return Response.json(
      { success: false, message: "Failed to load job preferences." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const preferredRoles: string[] = body?.preferredRoles ?? [];
    const preferredLocations: string[] = body?.preferredLocations ?? [];
    const preferredWorkMode: string | null = body?.preferredWorkMode ?? null;

    const { error } = await supabase.from("job_preferences").upsert({
      user_id: user.id,
      preferred_roles: preferredRoles,
      preferred_locations: preferredLocations,
      preferred_work_mode: preferredWorkMode,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Job preferences update error:", error);

    return Response.json(
      { success: false, message: "Failed to save job preferences." },
      { status: 500 }
    );
  }
}
