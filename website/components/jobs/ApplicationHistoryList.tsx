import Link from "next/link";
import type { ApplicationStatus, JobApplication } from "@/types/jobs";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  offer_received: "Offer Received",
  rejected: "Rejected",
  archived: "Archived",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApplicationHistoryList({ applications }: { applications: JobApplication[] }) {
  return (
    <div className="space-y-3">
      {applications.map((application) => (
        <Link
          key={application.id}
          href={`/jobs/${application.job.slug}`}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber/20 bg-panel p-5 shadow-md transition hover:border-amber"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-bone">{application.job.title}</p>
            <p className="mt-1 text-sm text-slate">
              {application.job.company} · Applied {formatDate(application.appliedAt)}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
            {STATUS_LABELS[application.status]}
          </span>
        </Link>
      ))}
    </div>
  );
}
