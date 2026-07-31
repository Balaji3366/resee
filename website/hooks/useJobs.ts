import { useCallback, useEffect, useState } from "react";
import type { JobExperienceLevel, JobSummary, JobType, JobWorkMode } from "@/types/jobs";

export interface JobsFilters {
  q?: string;
  experience?: JobExperienceLevel[];
  workMode?: JobWorkMode[];
  jobType?: JobType[];
  salaryBand?: string[];
}

function buildQuery(filters: JobsFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.experience?.length) params.set("experience", filters.experience.join(","));
  if (filters.workMode?.length) params.set("workMode", filters.workMode.join(","));
  if (filters.jobType?.length) params.set("jobType", filters.jobType.join(","));
  if (filters.salaryBand?.length) params.set("salaryBand", filters.salaryBand.join(","));
  return params.toString();
}

export function useJobs(filters: JobsFilters) {
  const [data, setData] = useState<JobSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = buildQuery(filters);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/jobs${queryString ? `?${queryString}` : ""}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load jobs.");
      }

      setData(json.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
