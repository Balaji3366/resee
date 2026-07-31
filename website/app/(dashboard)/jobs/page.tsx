"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Bookmark, Briefcase, Search } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import JobPreferencesCard from "@/components/jobs/JobPreferencesCard";
import JobEmptyState from "@/components/jobs/JobEmptyState";
import PracticeStatTile from "@/components/practice/PracticeStatTile";
import { useRecommendedJobs } from "@/hooks/useRecommendedJobs";
import { useJobs } from "@/hooks/useJobs";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useJobApplications } from "@/hooks/useJobApplications";
import type { ApplicationStatus } from "@/types/jobs";

export default function JobsDashboardPage() {
  const { data: recommended, basis, loading: recommendedLoading } = useRecommendedJobs();
  const { data: recent, loading: recentLoading } = useJobs({});
  const { data: saved, loading: savedLoading, save, unsave } = useSavedJobs();
  const { data: applications, loading: applicationsLoading } = useJobApplications();

  const savedIds = useMemo(() => new Set((saved ?? []).map((s) => s.job.id)), [saved]);
  const statusByJobId = useMemo(() => {
    const map = new Map<string, ApplicationStatus>();
    for (const app of applications ?? []) map.set(app.job.id, app.status);
    return map;
  }, [applications]);

  const statusCounts = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      applied: 0,
      interview_scheduled: 0,
      offer_received: 0,
      rejected: 0,
      archived: 0,
    };
    for (const app of applications ?? []) counts[app.status]++;
    return counts;
  }, [applications]);

  async function toggleSave(jobId: string) {
    if (savedIds.has(jobId)) await unsave(jobId);
    else await save(jobId);
  }

  const recentJobs = (recent ?? []).slice(0, 6);
  const nothingYet =
    !recommendedLoading &&
    !recentLoading &&
    (recommended?.length ?? 0) === 0 &&
    (recentJobs.length ?? 0) === 0;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">Jobs</h1>
          <p className="mt-2 text-slate">Discover, save, and track opportunities that fit your goals.</p>
        </div>

        <Link
          href="/jobs/search"
          className="flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 font-semibold text-white transition hover:bg-amber-dim"
        >
          <Search size={18} /> Search Jobs
        </Link>
      </div>

      <div className="mb-8">
        <JobPreferencesCard />
      </div>

      {nothingYet && (
        <div className="mb-10">
          <JobEmptyState />
        </div>
      )}

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/jobs/saved">
          <PracticeStatTile
            label="Saved Jobs"
            value={savedLoading ? "..." : String(saved?.length ?? 0)}
            icon={Bookmark}
          />
        </Link>
        <Link href="/jobs/applications">
          <PracticeStatTile
            label="Applied"
            value={applicationsLoading ? "..." : String(statusCounts.applied)}
            icon={CheckCircle2}
          />
        </Link>
        <Link href="/jobs/applications">
          <PracticeStatTile
            label="Interviews Scheduled"
            value={applicationsLoading ? "..." : String(statusCounts.interview_scheduled)}
            icon={Briefcase}
          />
        </Link>
        <Link href="/jobs/applications">
          <PracticeStatTile
            label="Offers Received"
            value={applicationsLoading ? "..." : String(statusCounts.offer_received)}
            icon={CheckCircle2}
          />
        </Link>
      </div>

      {(recommended?.length ?? 0) > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-slate">
            Recommended Jobs
            {basis === "recent" && (
              <span className="ml-2 text-xs font-normal text-slate">
                — set your preferences above for better matches
              </span>
            )}
          </h2>
          <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {(recommended ?? []).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onToggleSave={() => toggleSave(job.id)}
                applicationStatus={statusByJobId.get(job.id) ?? null}
              />
            ))}
          </div>
        </>
      )}

      {recentJobs.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-slate">Recently Added Jobs</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {recentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onToggleSave={() => toggleSave(job.id)}
                applicationStatus={statusByJobId.get(job.id) ?? null}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
