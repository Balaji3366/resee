import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminJobSummary } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select(
        "id, slug, title, company, location, work_mode, job_type, experience_level, is_available, posted_at"
      )
      .order("posted_at", { ascending: false });

    if (error) throw error;

    const jobs: AdminJobSummary[] = (data ?? []).map((j) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      company: j.company,
      location: j.location,
      workMode: j.work_mode,
      jobType: j.job_type,
      experienceLevel: j.experience_level,
      isAvailable: j.is_available,
      postedAt: j.posted_at,
    }));

    return Response.json({ success: true, jobs });
  } catch (error) {
    console.error("Admin jobs list error:", error);

    return Response.json({ success: false, message: "Failed to load jobs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const {
      slug,
      title,
      company,
      location,
      roleSlug,
      workMode,
      jobType,
      experienceLevel,
      experienceMinYears,
      experienceMaxYears,
      salaryMin,
      salaryMax,
      skills,
      description,
      responsibilities,
      eligibility,
      applyUrl,
    } = body ?? {};

    if (
      !slug ||
      !title ||
      !company ||
      !location ||
      !workMode ||
      !jobType ||
      !experienceLevel ||
      !description
    ) {
      return Response.json(
        {
          success: false,
          message:
            "slug, title, company, location, workMode, jobType, experienceLevel, and description are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert({
        slug,
        title,
        company,
        location,
        role_slug: roleSlug || null,
        work_mode: workMode,
        job_type: jobType,
        experience_level: experienceLevel,
        experience_min_years: experienceMinYears ?? null,
        experience_max_years: experienceMaxYears ?? null,
        salary_min: salaryMin ?? null,
        salary_max: salaryMax ?? null,
        skills: skills ?? [],
        description,
        responsibilities: responsibilities ?? [],
        eligibility: eligibility ?? [],
        apply_url: applyUrl || null,
        is_available: false,
      })
      .select("id")
      .single();

    if (error) throw error;

    return Response.json({ success: true, jobId: data.id });
  } catch (error) {
    console.error("Admin job create error:", error);

    return Response.json({ success: false, message: "Failed to create job." }, { status: 500 });
  }
}
