import { useEffect, useState } from "react";
import { dedupedFetchJson } from "@/lib/dedupedFetch";

export interface ProfileData {
  goal: string | null;
  targetCareer: string | null;
  userType: string | null;
  skillLevel: string | null;
  onboardingCompleted: boolean;
}

export function useProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { ok, json } = await dedupedFetchJson<{
          success: boolean;
          message?: string;
          goal: string | null;
          targetCareer: string | null;
          userType: string | null;
          skillLevel: string | null;
          onboardingCompleted: boolean;
        }>("/api/profile");

        if (!ok || !json?.success) {
          throw new Error(json?.message || "Failed to load profile.");
        }

        setData({
          goal: json.goal,
          targetCareer: json.targetCareer,
          userType: json.userType,
          skillLevel: json.skillLevel,
          onboardingCompleted: json.onboardingCompleted,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
