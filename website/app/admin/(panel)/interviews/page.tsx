"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAdminInterviewSets } from "@/hooks/useAdminInterviewSets";

export default function AdminInterviewSetsPage() {
  const { data: sets, loading } = useAdminInterviewSets();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            Mock Interviews
          </h1>
          <p className="mt-2 text-slate">Manage interview sets and their question banks.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/interviews/categories"
            className="flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-3 font-semibold text-bone transition hover:border-amber"
          >
            Categories
          </Link>
          <Link
            href="/admin/interviews/roles"
            className="flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-3 font-semibold text-bone transition hover:border-amber"
          >
            Roles
          </Link>
          <Link
            href="/admin/interviews/new"
            className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim"
          >
            <Plus size={18} />
            New Set
          </Link>
        </div>
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
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Experience</th>
                <th className="px-6 py-4 font-semibold">Available</th>
                <th className="px-6 py-4 font-semibold">Questions</th>
              </tr>
            </thead>
            <tbody>
              {(sets ?? []).map((set) => (
                <tr
                  key={set.id}
                  className="cursor-pointer border-b border-bone/5 transition hover:bg-panel-2/30"
                  onClick={() => (window.location.href = `/admin/interviews/${set.id}`)}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-bone">{set.title}</p>
                    <p className="text-xs text-slate">{set.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-slate">
                    {set.category ? `${set.category.icon} ${set.category.name}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate">
                    {set.role ? `${set.role.icon} ${set.role.name}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate">{set.experienceLevel}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        set.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
                      }`}
                    >
                      {set.isAvailable ? "Available" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate">{set.questionCount}</td>
                </tr>
              ))}

              {(sets ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate">
                    No interview sets yet — create your first one.
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
