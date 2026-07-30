import { useEffect, useState } from "react";

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
        const res = await fetch("/api/profile");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load profile.");
        }

        setData({
          goal: json.goal,
          targetCareer: json.targetCareer,
          userType: json.userType,
          skillLevel: json.skillLevel,
          onboardingCompleted: json.onboardingCompleted,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
