"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, ExternalLink } from "lucide-react";
import BookmarkButton from "@/components/practice/BookmarkButton";
import { useJob } from "@/hooks/useJob";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useJobApplications } from "@/hooks/useJobApplications";
import { useResumes } from "@/hooks/useResumes";

function formatSalary(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `₹${min}-${max} LPA`;
  return `₹${min ?? max} LPA`;
}

export default function JobDetailsPage({ params }: { params: Promise<{ jobSlug: string }> }) {
  const { jobSlug } = use(params);
  const { data: job, loading } = useJob(jobSlug);
  const { data: saved, save, unsave } = useSavedJobs();
  const { data: applications, apply } = useJobApplications();
  const { data: resumes } = useResumes();
  const [applying, setApplying] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const isSaved = useMemo(
    () => (saved ?? []).some((s) => s.job.slug === jobSlug),
    [saved, jobSlug]
  );

  const applicationStatus = useMemo(
    () => (applications ?? []).find((a) => a.job.slug === jobSlug)?.status ?? null,
    [applications, jobSlug]
  );

  async function toggleSave() {
    if (!job) return;
    if (isSaved) await unsave(job.id);
    else await save(job.id);
  }

  async function handleApply() {
    if (!job) return;
    setApplying(true);
    try {
      if (job.applyUrl) window.open(job.applyUrl, "_blank", "noopener,noreferrer");
      await apply(job.id, selectedResumeId || undefined);
    } finally {
      setApplying(false);
    }
  }

  if (loading || !job) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="h-96 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      </div>
    );
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/jobs/search"
        className="flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-bone"
      >
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="mt-4 rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
        <h1 className="font-display text-3xl font-extrabold text-bone">{job.title}</h1>
        <p className="mt-1 text-lg text-slate">{job.company}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase size={14} /> {job.workMode} · {job.jobType}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-panel-2 px-4 py-2 capitalize text-slate">
            {job.experienceLevel.replace(/-/g, " ")} experience
          </span>
          {salary && <span className="rounded-full bg-panel-2 px-4 py-2 text-slate">{salary}</span>}
        </div>

        {job.skills.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate">Skills Required</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-ink px-3 py-1.5 text-xs text-slate">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate">Description</h2>
          <p className="text-bone">{job.description}</p>
        </div>

        {job.responsibilities.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate">Responsibilities</h2>
            <ul className="list-disc space-y-1 pl-5 text-bone">
              {job.responsibilities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {job.eligibility.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate">Eligibility</h2>
            <ul className="list-disc space-y-1 pl-5 text-bone">
              {job.eligibility.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!applicationStatus && resumes && resumes.length > 0 && (
          <div className="mt-8">
            <label className="mb-1.5 block text-sm font-semibold text-slate">
              Apply with resume (optional)
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-bone/15 bg-panel px-4 py-2.5 text-bone outline-none focus:border-amber"
            >
              <option value="">No resume attached</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleApply}
            disabled={applying || applicationStatus !== null}
            className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applicationStatus ? "Applied" : applying ? "Applying..." : "Apply"}
            {job.applyUrl && !applicationStatus && <ExternalLink size={16} />}
          </button>

          <BookmarkButton bookmarked={isSaved} onToggle={toggleSave} />
        </div>
      </div>
    </div>
  );
}
