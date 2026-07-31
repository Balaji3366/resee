import { getServerSupabase } from "@/lib/supabaseServer";
import type { JobSummary } from "@/types/jobs";

export const dynamic = "force-dynamic";

function toSummary(row: Record<string, unknown>): JobSummary {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    company: row.company as string,
    roleSlug: (row.role_slug as string) ?? null,
    location: row.location as string,
    workMode: row.work_mode as JobSummary["workMode"],
    jobType: row.job_type as JobSummary["jobType"],
    experienceLevel: row.experience_level as JobSummary["experienceLevel"],
    salaryMin: (row.salary_min as number) ?? null,
    salaryMax: (row.salary_max as number) ?? null,
    skills: (row.skills as string[]) ?? [],
    postedAt: row.posted_at as string,
  };
}

const LIMIT = 6;

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: preferences } = await supabase
      .from("job_preferences")
      .select("preferred_roles")
      .eq("user_id", user.id)
      .maybeSingle();

    const preferredRoles = preferences?.preferred_roles ?? [];

    if (preferredRoles.length > 0) {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_available", true)
        .in("role_slug", preferredRoles)
        .order("posted_at", { ascending: false })
        .limit(LIMIT);

      if (data && data.length > 0) {
        return Response.json({ success: true, jobs: data.map(toSummary), basis: "preferences" });
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("target_career")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.target_career) {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_available", true)
        .ilike("title", `%${profile.target_career}%`)
        .order("posted_at", { ascending: false })
        .limit(LIMIT);

      if (data && data.length > 0) {
        return Response.json({ success: true, jobs: data.map(toSummary), basis: "target_career" });
      }
    }

    const { data: recent } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_available", true)
      .order("posted_at", { ascending: false })
      .limit(LIMIT);

    return Response.json({ success: true, jobs: (recent ?? []).map(toSummary), basis: "recent" });
  } catch (error) {
    console.error("Recommended jobs error:", error);

    return Response.json(
      { success: false, message: "Failed to load recommended jobs." },
      { status: 500 }
    );
  }
}
