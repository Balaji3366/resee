import { Lock } from "lucide-react";
import type { AchievementStatus } from "@/types/progress";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AchievementBadgeGrid({
  achievements,
}: {
  achievements: AchievementStatus[];
}) {
  return (
    <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
      <h2 className="text-lg font-semibold text-slate">Achievements</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-2xl border p-5 transition-all duration-300 ${
              achievement.earned
                ? "border-amber/20 bg-panel-2/40 hover:-translate-y-1 hover:shadow-lg"
                : "border-dashed border-bone/15 opacity-60"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2 text-2xl">
              {achievement.earned ? achievement.icon : <Lock size={22} className="text-slate" />}
            </div>

            <h3 className="mt-4 font-semibold text-bone">{achievement.title}</h3>
            <p className="mt-1 text-sm text-slate">{achievement.description}</p>

            {achievement.earned && achievement.earnedAt && (
              <p className="mt-3 text-xs font-semibold text-amber">
                Earned {formatDate(achievement.earnedAt)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
