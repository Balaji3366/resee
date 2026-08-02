import { supabaseAdmin } from "@/lib/supabase-admin";
import { authorizeAdminRequest } from "@/lib/adminAuth";
import type { AdminJobDetail } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!job) {
      return Response.json({ success: false, message: "Job not found." }, { status: 404 });
    }

    const detail: AdminJobDetail = {
      id: job.id,
      slug: job.slug,
      title: job.title,
      company: job.company,
      location: job.location,
      roleSlug: job.role_slug,
      workMode: job.work_mode,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      experienceMinYears: job.experience_min_years,
      experienceMaxYears: job.experience_max_years,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      skills: job.skills ?? [],
      description: job.description,
      responsibilities: job.responsibilities ?? [],
      eligibility: job.eligibility ?? [],
      applyUrl: job.apply_url,
      isAvailable: job.is_available,
    };

    return Response.json({ success: true, job: detail });
  } catch (error) {
    console.error("Admin job detail error:", error);

    return Response.json({ success: false, message: "Failed to load job." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.company === "string") updates.company = body.company;
    if (typeof body.location === "string") updates.location = body.location;
    if (typeof body.roleSlug !== "undefined") updates.role_slug = body.roleSlug || null;
    if (typeof body.workMode === "string") updates.work_mode = body.workMode;
    if (typeof body.jobType === "string") updates.job_type = body.jobType;
    if (typeof body.experienceLevel === "string") updates.experience_level = body.experienceLevel;
    if (typeof body.experienceMinYears !== "undefined")
      updates.experience_min_years = body.experienceMinYears;
    if (typeof body.experienceMaxYears !== "undefined")
      updates.experience_max_years = body.experienceMaxYears;
    if (typeof body.salaryMin !== "undefined") updates.salary_min = body.salaryMin;
    if (typeof body.salaryMax !== "undefined") updates.salary_max = body.salaryMax;
    if (Array.isArray(body.skills)) updates.skills = body.skills;
    if (typeof body.description === "string") updates.description = body.description;
    if (Array.isArray(body.responsibilities)) updates.responsibilities = body.responsibilities;
    if (Array.isArray(body.eligibility)) updates.eligibility = body.eligibility;
    if (typeof body.applyUrl !== "undefined") updates.apply_url = body.applyUrl || null;
    if (typeof body.isAvailable === "boolean") updates.is_available = body.isAvailable;

    const { error } = await supabaseAdmin.from("jobs").update(updates).eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin job update error:", error);

    return Response.json({ success: false, message: "Failed to update job." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorizeAdminRequest(["super_admin", "admin"]);
    if (auth.error) return auth.error;

    const { error } = await supabaseAdmin.from("jobs").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin job delete error:", error);

    return Response.json({ success: false, message: "Failed to delete job." }, { status: 500 });
  }
}
