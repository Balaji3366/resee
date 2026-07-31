"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";
import MultiSelectChips from "@/components/jobs/MultiSelectChips";
import JobEmptyState from "@/components/jobs/JobEmptyState";
import { useJobs } from "@/hooks/useJobs";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useJobApplications } from "@/hooks/useJobApplications";
import type { ApplicationStatus, JobExperienceLevel, JobType, JobWorkMode } from "@/types/jobs";

const EXPERIENCE_OPTIONS: { slug: JobExperienceLevel; label: string }[] = [
  { slug: "fresher", label: "Fresher" },
  { slug: "1-3-years", label: "1–3 Years" },
  { slug: "3-5-years", label: "3–5 Years" },
  { slug: "5-plus-years", label: "5+ Years" },
];

const WORK_MODE_OPTIONS: { slug: JobWorkMode; label: string }[] = [
  { slug: "remote", label: "Remote" },
  { slug: "hybrid", label: "Hybrid" },
  { slug: "onsite", label: "Onsite" },
];

const JOB_TYPE_OPTIONS: { slug: JobType; label: string }[] = [
  { slug: "full-time", label: "Full-Time" },
  { slug: "part-time", label: "Part-Time" },
  { slug: "internship", label: "Internship" },
  { slug: "contract", label: "Contract" },
];

const SALARY_BAND_OPTIONS = [
  { slug: "0-5", label: "0-5 LPA" },
  { slug: "5-10", label: "5-10 LPA" },
  { slug: "10-15", label: "10-15 LPA" },
  { slug: "15+", label: "15+ LPA" },
];

function toggle<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function JobSearchPage() {
  const [q, setQ] = useState("");
  const [experience, setExperience] = useState<JobExperienceLevel[]>([]);
  const [workMode, setWorkMode] = useState<JobWorkMode[]>([]);
  const [jobType, setJobType] = useState<JobType[]>([]);
  const [salaryBand, setSalaryBand] = useState<string[]>([]);

  const { data: jobs, loading } = useJobs({ q, experience, workMode, jobType, salaryBand });
  const { data: saved, save, unsave } = useSavedJobs();
  const { data: applications } = useJobApplications();

  const savedIds = useMemo(() => new Set((saved ?? []).map((s) => s.job.id)), [saved]);
  const statusByJobId = useMemo(() => {
    const map = new Map<string, ApplicationStatus>();
    for (const app of applications ?? []) map.set(app.job.id, app.status);
    return map;
  }, [applications]);

  async function toggleSave(jobId: string) {
    if (savedIds.has(jobId)) await unsave(jobId);
    else await save(jobId);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">Search Jobs</h1>
        <p className="mt-2 text-slate">Search by title, company, location, or skill.</p>
      </div>

      <div className="mb-8 flex h-14 items-center gap-3 rounded-xl border border-bone/15 px-4 transition focus-within:border-amber">
        <Search size={18} className="text-amber" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jobs..."
          className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
        />
      </div>

      <div className="mb-8 grid gap-6 rounded-3xl border border-amber/20 bg-panel p-6 shadow-md sm:grid-cols-2 xl:grid-cols-4">
        <MultiSelectChips
          label="Experience"
          options={EXPERIENCE_OPTIONS}
          selectedSlugs={experience}
          onToggle={(slug) => setExperience((prev) => toggle(prev, slug as JobExperienceLevel))}
        />
        <MultiSelectChips
          label="Work Mode"
          options={WORK_MODE_OPTIONS}
          selectedSlugs={workMode}
          onToggle={(slug) => setWorkMode((prev) => toggle(prev, slug as JobWorkMode))}
        />
        <MultiSelectChips
          label="Job Type"
          options={JOB_TYPE_OPTIONS}
          selectedSlugs={jobType}
          onToggle={(slug) => setJobType((prev) => toggle(prev, slug as JobType))}
        />
        <MultiSelectChips
          label="Salary Range"
          options={SALARY_BAND_OPTIONS}
          selectedSlugs={salaryBand}
          onToggle={(slug) => setSalaryBand((prev) => toggle(prev, slug))}
        />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          ))}
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <JobEmptyState message="No jobs match your filters yet. Try broadening your search." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedIds.has(job.id)}
              onToggleSave={() => toggleSave(job.id)}
              applicationStatus={statusByJobId.get(job.id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
