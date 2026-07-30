"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import ResumeCard from "@/components/resume-builder/ResumeCard";
import ConfirmModal from "@/components/ConfirmModal";

export default function ArchivedResumesPage() {
  const { data: resumes, loading, refetch } = useResumes("archived");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
    const json = await res.json();
    if (json.success) refetch();
  }

  async function handleRestore(id: string) {
    await fetch(`/api/resumes/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    refetch();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/resumes/${deleteTarget}`, { method: "DELETE" });
      setDeleteTarget(null);
      refetch();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/resumes" className="flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-bone">
        <ArrowLeft size={16} /> Back to My Resumes
      </Link>

      <h1 className="mt-4 font-display text-3xl font-extrabold text-bone md:text-4xl">Archived Resumes</h1>
      <p className="mt-2 text-slate">Restore an archived resume or delete it permanently.</p>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
            ))}
          </div>
        ) : !resumes || resumes.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-bone/15 bg-panel px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-slate">
              <Archive size={28} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-bone">No archived resumes</h2>
            <p className="mt-2 max-w-sm text-slate">Resumes you archive will show up here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDuplicate={() => handleDuplicate(resume.id)}
                onArchiveToggle={() => handleRestore(resume.id)}
                onDelete={() => setDeleteTarget(resume.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this resume?"
        message="This will permanently delete the resume and all of its version history. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
