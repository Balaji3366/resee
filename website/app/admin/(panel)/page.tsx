"use client";

import { Users, UserCheck, Activity, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import AdminTrendChart from "@/components/admin/AdminTrendChart";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";

export default function AdminDashboardPage() {
  const { data: stats, loading } = useAdminDashboardStats();

  if (loading || !stats) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          ))}
        </div>
      </div>
    );
  }

  const quizCompletionRateTrend = stats.quizCompletionRate.map((p) => ({
    periodStart: p.periodStart,
    count:
      p.passed + p.failed > 0 ? Math.round((p.passed / (p.passed + p.failed)) * 100) : 0,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate">Platform-wide overview.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <PracticeStatTile label="Total Users" value={String(stats.totalUsers)} icon={Users} />
        <PracticeStatTile
          label="Active Users (7d)"
          value={String(stats.activeUsers)}
          icon={UserCheck}
        />
        <PracticeStatTile
          label="Daily Active Users"
          value={String(stats.dailyActiveUsers)}
          icon={Activity}
        />
        <PracticeStatTile
          label="Learning Paths"
          value={`${stats.learningPathsPublished} published`}
          icon={BookOpen}
        />
      </div>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <PracticeStatTile
          label="Total Enrollments"
          value={String(stats.totalEnrollments)}
          icon={GraduationCap}
        />
        <PracticeStatTile
          label="Quiz Completions"
          value={String(stats.quizCompletions)}
          icon={CheckCircle2}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AdminTrendChart title="User Growth" data={stats.userGrowth} gradientId="adminUserGrowthFill" />
        <AdminTrendChart
          title="Learning Activity"
          data={stats.learningActivity}
          gradientId="adminLearningActivityFill"
        />
      </div>

      <div className="mt-6">
        <AdminTrendChart
          title="Quiz Completion Rate (%)"
          data={quizCompletionRateTrend}
          gradientId="adminQuizRateFill"
        />
      </div>
    </div>
  );
}
