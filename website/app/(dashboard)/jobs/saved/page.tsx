"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import JobEmptyState from "@/components/jobs/JobEmptyState";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useJobApplications } from "@/hooks/useJobApplications";
import type { ApplicationStatus } from "@/types/jobs";

type SortOrder = "recent" | "title";

export default function SavedJobsPage() {
  const { data: saved, loading, unsave } = useSavedJobs();
  const { data: applications } = useJobApplications();
  const [sort, setSort] = useState<SortOrder>("recent");

  const statusByJobId = useMemo(() => {
    const map = new Map<string, ApplicationStatus>();
    for (const app of applications ?? []) map.set(app.job.id, app.status);
    return map;
  }, [applications]);

  const sorted = useMemo(() => {
    const list = saved ?? [];
    if (sort === "title") {
      return [...list].sort((a, b) => a.job.title.localeCompare(b.job.title));
    }
    return list;
  }, [saved, sort]);

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/jobs" className="flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-bone">
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">Saved Jobs</h1>
          <p className="mt-2 text-slate">Jobs you&apos;ve bookmarked for later.</p>
        </div>

        {(saved?.length ?? 0) > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
              className="rounded-lg border border-bone/15 bg-panel px-3 py-1.5 text-bone focus:border-amber focus:outline-none"
            >
              <option value="recent">Recently Saved</option>
              <option value="title">Title</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <JobEmptyState message="Jobs you save will show up here." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((item) => (
            <JobCard
              key={item.id}
              job={item.job}
              saved
              onToggleSave={() => unsave(item.job.id)}
              applicationStatus={statusByJobId.get(item.job.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
