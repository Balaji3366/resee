"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useAdminPracticeTopics } from "@/hooks/useAdminPracticeTopics";

export default function AdminPracticeTopicsPage() {
  const { data: topics, loading } = useAdminPracticeTopics();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            Practice Topics
          </h1>
          <p className="mt-2 text-slate">Manage practice topics and their question banks.</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/practice/categories"
            className="flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-3 font-semibold text-bone transition hover:border-amber"
          >
            Manage Categories
          </Link>

          <Link
            href="/admin/practice/new"
            className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim"
          >
            <Plus size={18} />
            New Topic
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
                <th className="px-6 py-4 font-semibold">Difficulty</th>
                <th className="px-6 py-4 font-semibold">Available</th>
                <th className="px-6 py-4 font-semibold">Questions</th>
                <th className="px-6 py-4 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {(topics ?? []).map((topic) => (
                <tr
                  key={topic.id}
                  className="cursor-pointer border-b border-bone/5 transition hover:bg-panel-2/30"
                  onClick={() => (window.location.href = `/admin/practice/${topic.id}`)}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-bone">{topic.title}</p>
                    <p className="text-xs text-slate">{topic.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-slate">
                    {topic.category ? `${topic.category.icon} ${topic.category.name}` : "—"}
                  </td>
                  <td className="px-6 py-4 capitalize text-slate">{topic.difficulty}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        topic.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
                      }`}
                    >
                      {topic.isAvailable ? "Available" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate">{topic.questionCount}</td>
                  <td className="px-6 py-4 text-slate">
                    {new Date(topic.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {(topics ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate">
                    No practice topics yet — create your first one.
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
