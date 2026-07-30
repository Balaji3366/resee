import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Session refresh already happens in proxy.ts for every
            // protected route (including /dashboard), so cookies are
            // already current by the time this route handler runs.
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
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

    return Response.json(
      { success: false, message: "Failed to load profile." },
      { status: 500 }
    );
  }
}
