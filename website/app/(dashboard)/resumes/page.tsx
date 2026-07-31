"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import ResumeCard from "@/components/resume-builder/ResumeCard";
import ConfirmModal from "@/components/ConfirmModal";

export default function ResumesPage() {
  const router = useRouter();
  const { data: resumes, loading, refetch } = useResumes();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
    const json = await res.json();
    if (json.success) refetch();
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">My Resumes</h1>
          <p className="mt-2 text-slate">ReSee builds your resume for you — just answer a few questions.</p>
        </div>

        <button
          onClick={() => router.push("/resumes/new")}
          className="flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 font-semibold text-white transition hover:bg-amber-dim"
        >
          <Plus size={18} /> Create Resume
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
          ))}
        </div>
      ) : !resumes || resumes.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-bone/15 bg-panel px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-amber">
            <FileText size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-bone">Let&apos;s build your professional resume.</h2>
          <p className="mt-2 max-w-sm text-slate">
            Answer a few questions and ReSee will automatically generate a professional, ATS-ready
            resume for you.
          </p>
          <button
            onClick={() => router.push("/resumes/new")}
            className="mt-6 flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-semibold text-white transition hover:bg-amber-dim"
          >
            <Plus size={18} /> Create Resume
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDuplicate={() => handleDuplicate(resume.id)}
              onDelete={() => setDeleteTarget(resume.id)}
            />
          ))}
        </div>
      )}

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
