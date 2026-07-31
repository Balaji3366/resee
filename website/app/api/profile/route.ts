import { getServerSupabase } from "@/lib/supabaseServer";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("goal, target_career, role_type, skill_level, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    return Response.json({
      success: true,
      goal: profile?.goal ?? null,
      targetCareer: profile?.target_career ?? null,
      userType: profile?.role_type ?? null,
      skillLevel: profile?.skill_level ?? null,
      onboardingCompleted: profile?.onboarding_completed ?? false,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);

    return Response.json({ success: false, message: "Failed to load profile." }, { status: 500 });
  }
}
