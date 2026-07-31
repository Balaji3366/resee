import { getServerSupabase } from "@/lib/supabaseServer";
import type { ApplicationStatus, JobApplication, JobSummary } from "@/types/jobs";

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

export async function GET(request: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") as ApplicationStatus | null;
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

    let query = supabase
      .from("job_applications")
      .select("id, status, applied_at, updated_at, job:jobs(*)")
      .eq("user_id", user.id);

    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("applied_at", { ascending: false });

    if (error) throw error;

    let applications: JobApplication[] = (data ?? [])
      .filter((row) => row.job)
      .map((row) => ({
        id: row.id,
        status: row.status,
        appliedAt: row.applied_at,
        updatedAt: row.updated_at,
        job: toSummary(row.job as unknown as Record<string, unknown>),
      }));

    if (q) {
      applications = applications.filter(
        (a) => a.job.title.toLowerCase().includes(q) || a.job.company.toLowerCase().includes(q)
      );
    }

    return Response.json({ success: true, applications });
  } catch (error) {
    console.error("Job applications list error:", error);

    return Response.json(
      { success: false, message: "Failed to load applications." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const jobId: string | undefined = body?.jobId;

    if (!jobId) {
      return Response.json({ success: false, message: "jobId is required." }, { status: 400 });
    }

    const { error } = await supabase.from("job_applications").upsert(
      { user_id: user.id, job_id: jobId, status: "applied" },
      { onConflict: "user_id,job_id", ignoreDuplicates: true }
    );

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Apply to job error:", error);

    return Response.json({ success: false, message: "Failed to apply to job." }, { status: 500 });
  }
}
