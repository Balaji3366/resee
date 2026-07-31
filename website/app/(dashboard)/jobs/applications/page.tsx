"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import ApplicationTrackerBoard from "@/components/jobs/ApplicationTrackerBoard";
import ApplicationHistoryList from "@/components/jobs/ApplicationHistoryList";
import { useJobApplications } from "@/hooks/useJobApplications";

type View = "board" | "history";

export default function ApplicationsPage() {
  const { data: applications, loading, updateStatus } = useJobApplications();
  const [view, setView] = useState<View>("board");
  const [search, setSearch] = useState("");

  const filtered = (applications ?? []).filter(
    (a) =>
      a.job.title.toLowerCase().includes(search.toLowerCase()) ||
      a.job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/jobs" className="flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-bone">
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            Application Tracker
          </h1>
          <p className="mt-2 text-slate">Track every application from applied to offer.</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-bone/15 bg-panel p-1">
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              view === "board" ? "bg-amber text-white" : "text-slate hover:text-bone"
            }`}
          >
            <LayoutGrid size={14} /> Board
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              view === "history" ? "bg-amber text-white" : "text-slate hover:text-bone"
            }`}
          >
            <List size={14} /> History
          </button>
        </div>
      </div>

      {view === "history" && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or company..."
          className="mb-6 w-full rounded-xl border border-bone/15 bg-ink px-4 py-3 text-bone placeholder:text-slate focus:border-amber focus:outline-none"
        />
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      ) : (applications?.length ?? 0) === 0 ? (
        <div className="rounded-3xl border border-dashed border-bone/15 bg-panel p-10 text-center shadow-md">
          <p className="text-slate">You haven&apos;t applied to any jobs yet.</p>
        </div>
      ) : view === "board" ? (
        <ApplicationTrackerBoard
          applications={applications ?? []}
          onStatusChange={updateStatus}
        />
      ) : (
        <ApplicationHistoryList applications={filtered} />
      )}
    </div>
  );
}
