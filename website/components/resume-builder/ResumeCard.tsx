"use client";

import { useRouter } from "next/navigation";
import { FileText, Copy, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import type { ResumeSummary } from "@/types/resume-builder";

export default function ResumeCard({
  resume,
  onDuplicate,
  onArchiveToggle,
  onDelete,
}: {
  resume: ResumeSummary;
  onDuplicate: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();

  return (
    <div className="group rounded-3xl border border-amber/20 bg-panel p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <button
        onClick={() => router.push(`/resumes/${resume.id}`)}
        className="flex w-full flex-col items-start text-left"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-amber">
          <FileText size={22} />
        </div>
        <h3 className="mt-4 truncate text-lg font-bold text-bone">{resume.title}</h3>
        <p className="mt-1 text-xs text-slate">
          Updated {new Date(resume.updatedAt).toLocaleDateString()}
        </p>
      </button>

      <div className="mt-4 flex items-center gap-2 border-t border-bone/10 pt-4">
        <button
          onClick={onDuplicate}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate hover:bg-ink hover:text-bone"
        >
          <Copy size={14} /> Duplicate
        </button>
        <button
          onClick={onArchiveToggle}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate hover:bg-ink hover:text-bone"
        >
          {resume.status === "active" ? <Archive size={14} /> : <ArchiveRestore size={14} />}
          {resume.status === "active" ? "Archive" : "Restore"}
        </button>
        <button
          onClick={onDelete}
          className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
