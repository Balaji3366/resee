import { getServerSupabase } from "@/lib/supabaseServer";
import type { JobSummary, SavedJob } from "@/types/jobs";

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

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("saved_jobs")
      .select("id, created_at, job:jobs(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const saved: SavedJob[] = (data ?? [])
      .filter((row) => row.job)
      .map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        job: toSummary(row.job as unknown as Record<string, unknown>),
      }));

    return Response.json({ success: true, saved });
  } catch (error) {
    console.error("Saved jobs list error:", error);

    return Response.json(
      { success: false, message: "Failed to load saved jobs." },
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

    const { error } = await supabase
      .from("saved_jobs")
      .upsert({ user_id: user.id, job_id: jobId }, { onConflict: "user_id,job_id", ignoreDuplicates: true });

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Save job error:", error);

    return Response.json({ success: false, message: "Failed to save job." }, { status: 500 });
  }
}
