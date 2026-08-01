"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAdminMockTests } from "@/hooks/useAdminMockTests";

export default function AdminMockTestsPage() {
  const { data: tests, loading } = useAdminMockTests();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">Mock Tests</h1>
          <p className="mt-2 text-slate">Manage timed mock tests and their question sets.</p>
        </div>

        <Link
          href="/admin/practice/mock-tests/new"
          className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim"
        >
          <Plus size={18} />
          New Mock Test
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
                <th className="px-6 py-4 font-semibold">Difficulty</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Available</th>
                <th className="px-6 py-4 font-semibold">Questions</th>
              </tr>
            </thead>
            <tbody>
              {(tests ?? []).map((test) => (
                <tr
                  key={test.id}
                  className="cursor-pointer border-b border-bone/5 transition hover:bg-panel-2/30"
                  onClick={() => (window.location.href = `/admin/practice/mock-tests/${test.id}`)}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-bone">{test.title}</p>
                    <p className="text-xs text-slate">{test.slug}</p>
                  </td>
                  <td className="px-6 py-4 capitalize text-slate">{test.difficulty}</td>
                  <td className="px-6 py-4 text-slate">{test.durationMinutes} min</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        test.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
                      }`}
                    >
                      {test.isAvailable ? "Available" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate">{test.questionCount}</td>
                </tr>
              ))}

              {(tests ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate">
                    No mock tests yet — create your first one.
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
