import ApplicationCard from "./ApplicationCard";
import type { ApplicationStatus, JobApplication } from "@/types/jobs";

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: "applied", label: "Applied" },
  { status: "interview_scheduled", label: "Interview Scheduled" },
  { status: "offer_received", label: "Offer Received" },
  { status: "rejected", label: "Rejected" },
  { status: "archived", label: "Archived" },
];

export default function ApplicationTrackerBoard({
  applications,
  onStatusChange,
}: {
  applications: JobApplication[];
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
}) {
  return (
    <div className="grid gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
      {COLUMNS.map((column) => {
        const items = applications.filter((a) => a.status === column.status);

        return (
          <div key={column.status} className="min-w-[220px] rounded-2xl border border-amber/20 bg-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate">{column.label}</h3>
              <span className="rounded-full bg-panel-2 px-2 py-0.5 text-xs font-bold text-slate">
                {items.length}
              </span>
            </div>

            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-xs text-slate">No applications here.</p>
              ) : (
                items.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onStatusChange={(status) => onStatusChange(application.id, status)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
