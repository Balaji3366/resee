import { getServerSupabase } from "@/lib/supabaseServer";
import type { JobDetail } from "@/types/jobs";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobSlug: string }> }
) {
  try {
    const { jobSlug } = await params;
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: row } = await supabase
      .from("jobs")
      .select("*")
      .eq("slug", jobSlug)
      .maybeSingle();

    if (!row) {
      return Response.json({ success: false, message: "Job not found." }, { status: 404 });
    }

    const job: JobDetail = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      company: row.company,
      roleSlug: row.role_slug ?? null,
      location: row.location,
      workMode: row.work_mode,
      jobType: row.job_type,
      experienceLevel: row.experience_level,
      experienceMinYears: row.experience_min_years ?? null,
      experienceMaxYears: row.experience_max_years ?? null,
      salaryMin: row.salary_min ?? null,
      salaryMax: row.salary_max ?? null,
      skills: row.skills ?? [],
      description: row.description,
      responsibilities: row.responsibilities ?? [],
      eligibility: row.eligibility ?? [],
      applyUrl: row.apply_url ?? null,
      postedAt: row.posted_at,
    };

    return Response.json({ success: true, job });
  } catch (error) {
    console.error("Job detail error:", error);

    return Response.json({ success: false, message: "Failed to load job." }, { status: 500 });
  }
}
