import Link from "next/link";
import type { ApplicationStatus, JobApplication } from "@/types/jobs";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "offer_received", label: "Offer Received" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

export default function ApplicationCard({
  application,
  onStatusChange,
}: {
  application: JobApplication;
  onStatusChange: (status: ApplicationStatus) => void;
}) {
  return (
    <div className="rounded-2xl border border-bone/10 bg-ink p-4">
      <Link href={`/jobs/${application.job.slug}`} className="block">
        <p className="truncate font-semibold text-bone">{application.job.title}</p>
        <p className="mt-0.5 text-sm text-slate">{application.job.company}</p>
      </Link>

      <p className="mt-2 text-xs text-slate">
        Applied {new Date(application.appliedAt).toLocaleDateString()}
        {application.resumeTitle ? ` · ${application.resumeTitle}` : ""}
      </p>

      <select
        value={application.status}
        onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
        className="mt-3 w-full rounded-lg border border-bone/15 bg-panel px-2 py-1.5 text-xs font-semibold text-bone focus:border-amber focus:outline-none"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
