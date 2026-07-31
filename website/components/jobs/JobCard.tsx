import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import BookmarkButton from "@/components/practice/BookmarkButton";
import type { ApplicationStatus, JobSummary } from "@/types/jobs";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  offer_received: "Offer Received",
  rejected: "Rejected",
  archived: "Archived",
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) return `₹${min}-${max} LPA`;
  return `₹${min ?? max} LPA`;
}

export default function JobCard({
  job,
  saved,
  onToggleSave,
  applicationStatus,
}: {
  job: JobSummary;
  saved: boolean;
  onToggleSave: () => void;
  applicationStatus?: ApplicationStatus | null;
}) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-amber/20 bg-panel p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <Link href={`/jobs/${job.slug}`} className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-bone">{job.title}</h3>
            <p className="mt-1 text-sm text-slate">{job.company}</p>
          </div>

          {applicationStatus && (
            <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
              {STATUS_LABELS[applicationStatus]}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={12} /> {job.workMode} · {job.jobType}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-panel-2 px-3 py-1 text-xs capitalize text-slate">
            {job.experienceLevel.replace(/-/g, " ")}
          </span>
          {salary && (
            <span className="rounded-full bg-panel-2 px-3 py-1 text-xs text-slate">{salary}</span>
          )}
        </div>

        {job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="rounded-full bg-ink px-2.5 py-1 text-[11px] text-slate">
                {skill}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="mt-4 border-t border-bone/10 pt-4">
        <BookmarkButton bookmarked={saved} onToggle={onToggleSave} />
      </div>
    </div>
  );
}
