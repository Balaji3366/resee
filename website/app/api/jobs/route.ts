import { getServerSupabase } from "@/lib/supabaseServer";
import type { JobSummary } from "@/types/jobs";

export const dynamic = "force-dynamic";

const SALARY_BANDS: Record<string, { min: number; max: number | null }> = {
  "0-5": { min: 0, max: 5 },
  "5-10": { min: 5, max: 10 },
  "10-15": { min: 10, max: 15 },
  "15+": { min: 15, max: null },
};

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
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const experience = url.searchParams.get("experience")?.split(",").filter(Boolean) ?? [];
    const workMode = url.searchParams.get("workMode")?.split(",").filter(Boolean) ?? [];
    const jobType = url.searchParams.get("jobType")?.split(",").filter(Boolean) ?? [];
    const salaryBands = url.searchParams.get("salaryBand")?.split(",").filter(Boolean) ?? [];
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 12));

    let query = supabase.from("jobs").select("*").eq("is_available", true);

    if (experience.length > 0) query = query.in("experience_level", experience);
    if (workMode.length > 0) query = query.in("work_mode", workMode);
    if (jobType.length > 0) query = query.in("job_type", jobType);

    const { data, error } = await query.order("posted_at", { ascending: false });

    if (error) throw error;

    let jobs: JobSummary[] = (data ?? []).map(toSummary);

    if (q) {
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.skills.some((skill) => skill.toLowerCase().includes(q))
      );
    }

    if (salaryBands.length > 0) {
      const bands = salaryBands.map((b) => SALARY_BANDS[b]).filter(Boolean);

      jobs = jobs.filter((job) => {
        if (job.salaryMin === null && job.salaryMax === null) return false;

        return bands.some((band) => {
          const jobMax = job.salaryMax ?? job.salaryMin ?? 0;
          const jobMin = job.salaryMin ?? job.salaryMax ?? 0;
          const bandMax = band.max ?? Infinity;
          return jobMax >= band.min && jobMin <= bandMax;
        });
      });
    }

    // q/salaryBand are filtered in-memory above (skills-substring and
    // salary-range overlap aren't expressible as simple PostgREST
    // filters without losing exactness), so pagination is applied to
    // the final filtered array here rather than via a DB .range() —
    // that keeps filter correctness across pages instead of slicing
    // before the in-memory filters have run.
    const total = jobs.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginated = jobs.slice(start, start + pageSize);

    return Response.json({ success: true, jobs: paginated, total, page, pageSize, totalPages });
  } catch (error) {
    console.error("Jobs list error:", error);

    return Response.json({ success: false, message: "Failed to load jobs." }, { status: 500 });
  }
}
