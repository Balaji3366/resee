import { useCallback, useEffect, useState } from "react";
import type { BookmarkedInterviewQuestion } from "@/types/interview";

export function useInterviewBookmarks() {
  const [data, setData] = useState<BookmarkedInterviewQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/interviews/bookmarks");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load bookmarks.");
      }

      setData(json.bookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookmarks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
