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

  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2">
        <Award size={24} className="text-amber" />
      </div>

      <h3 className="mt-6 text-lg font-semibold text-slate">
        Achievements
      </h3>

      {loading ? (
        <div className="mt-3 h-16 animate-pulse rounded bg-panel-2" />
      ) : (
        <div className="mt-3 space-y-2">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className={`flex items-center gap-2 text-sm ${
                badge.earned ? "text-bone" : "text-slate"
              }`}
            >
              {badge.earned ? (
                <Award size={16} className="shrink-0 text-amber" />
              ) : (
                <Lock size={16} className="shrink-0 text-slate" />
              )}

              {badge.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
