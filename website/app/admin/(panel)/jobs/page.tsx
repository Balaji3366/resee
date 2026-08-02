"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAdminJobs } from "@/hooks/useAdminJobs";

export default function AdminJobsPage() {
  const { data: jobs, loading } = useAdminJobs();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            Job Postings
          </h1>
          <p className="mt-2 text-slate">Manage the Jobs & Career Hub catalog.</p>
        </div>

        <Link
          href="/admin/jobs/new"
          className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim"
        >
          <Plus size={18} />
          New Job
        </Link>
      </div>

      {loading && (
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (
        <div className="overflow-x-auto rounded-3xl border border-amber/20 bg-panel shadow-md">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-bone/10 text-slate">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Work Mode</th>
                <th className="px-6 py-4 font-semibold">Experience</th>
                <th className="px-6 py-4 font-semibold">Available</th>
              </tr>
            </thead>
            <tbody>
              {(jobs ?? []).map((job) => (
                <tr
                  key={job.id}
                  className="cursor-pointer border-b border-bone/5 transition hover:bg-panel-2/30"
                  onClick={() => (window.location.href = `/admin/jobs/${job.id}`)}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-bone">{job.title}</p>
                    <p className="text-xs text-slate">{job.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-slate">{job.company}</td>
                  <td className="px-6 py-4 text-slate">{job.location}</td>
                  <td className="px-6 py-4 capitalize text-slate">{job.workMode}</td>
                  <td className="px-6 py-4 text-slate">{job.experienceLevel}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        job.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
                      }`}
                    >
                      {job.isAvailable ? "Available" : "Draft"}
                    </span>
                  </td>
                </tr>
              ))}

              {(jobs ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate">
                    No job postings yet — create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
