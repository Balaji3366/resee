import { Award, Lock } from "lucide-react";
import type { ProfileData } from "@/hooks/useProfile";
import type { CareerScoreData } from "@/hooks/useCareerScore";

interface DashboardAchievementsProps {
  profile: ProfileData | null;
  careerScore: CareerScoreData | null;
  resumeCount: number;
  loading: boolean;
}

export default function DashboardAchievements({
  profile,
  careerScore,
  resumeCount,
  loading,
}: DashboardAchievementsProps) {
  const badges = [
    {
      label: "Profile Completed",
      earned: profile?.onboardingCompleted ?? false,
    },
    {
      label: "First Resume Analyzed",
      earned: resumeCount > 0,
    },
    {
      label: "Career Score Generated",
      earned: careerScore?.overallStatus !== "insufficient_data" && !!careerScore,
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="rounded-[20px] border-2 border-bone bg-panel p-6">
      <p className="text-sm font-bold text-bone/50">Achievements</p>

      {loading ? (
        <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-panel-2" />
      ) : (
        <>
          <p className="mt-2 text-sm text-bone">
            {earnedCount} of {badges.length} earned
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className={`flex items-center gap-2 text-xs ${badge.earned ? "text-bone" : "text-bone/40"}`}
              >
                {badge.earned ? (
                  <Award size={14} className="shrink-0 text-amber" />
                ) : (
                  <Lock size={14} className="shrink-0 text-bone/40" />
                )}

                {badge.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
