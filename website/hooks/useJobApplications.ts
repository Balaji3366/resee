import { useCallback, useEffect, useState } from "react";
import type { ApplicationStatus, JobApplication } from "@/types/jobs";

export function useJobApplications() {
  const [data, setData] = useState<JobApplication[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/jobs/applications");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load applications.");
      }

      setData(json.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function apply(jobId: string, resumeId?: string) {
    await fetch("/api/jobs/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, resumeId }),
    });
    await load();
  }

  async function updateStatus(applicationId: string, status: ApplicationStatus) {
    await fetch(`/api/jobs/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return { data, loading, error, refetch: load, apply, updateStatus };
}
