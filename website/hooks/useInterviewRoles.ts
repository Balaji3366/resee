import { useEffect, useState } from "react";
import type { InterviewRole } from "@/types/interview";

export function useInterviewRoles() {
  const [data, setData] = useState<InterviewRole[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/interviews/roles");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load interview roles.");
        }

        setData(json.roles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interview roles.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
