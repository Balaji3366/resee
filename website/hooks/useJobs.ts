import { useCallback, useEffect, useState } from "react";
import type { JobExperienceLevel, JobSummary, JobType, JobWorkMode } from "@/types/jobs";

export interface JobsFilters {
  q?: string;
  experience?: JobExperienceLevel[];
  workMode?: JobWorkMode[];
  jobType?: JobType[];
  salaryBand?: string[];
  page?: number;
  pageSize?: number;
}

function buildQuery(filters: JobsFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.experience?.length) params.set("experience", filters.experience.join(","));
  if (filters.workMode?.length) params.set("workMode", filters.workMode.join(","));
  if (filters.jobType?.length) params.set("jobType", filters.jobType.join(","));
  if (filters.salaryBand?.length) params.set("salaryBand", filters.salaryBand.join(","));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export function useJobs(filters: JobsFilters) {
  const [data, setData] = useState<JobSummary[] | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
      setTotal(json.total ?? json.jobs.length);
      setTotalPages(json.totalPages ?? 1);
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

  return { data, total, totalPages, loading, error, refetch: load };
}
