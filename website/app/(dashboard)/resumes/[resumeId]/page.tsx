"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Copy, Download, History, Trash2 } from "lucide-react";
import { useResumeDetail } from "@/hooks/useResumeDetail";
import ModernTemplate from "@/components/resume-builder/templates/ModernTemplate";
import AtsFriendlyTemplate from "@/components/resume-builder/templates/AtsFriendlyTemplate";
import VersionHistoryDrawer from "@/components/resume-builder/VersionHistoryDrawer";
import ConfirmModal from "@/components/ConfirmModal";
import { downloadResumePdf } from "@/lib/resume-pdf";

export default function ResumePreviewPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = use(params);
  const router = useRouter();

  const { data: resume, loading, refetch } = useResumeDetail(resumeId);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDuplicate() {
    const res = await fetch(`/api/resumes/${resumeId}/duplicate`, { method: "POST" });
    const json = await res.json();
    if (json.success) router.push(`/resumes/${json.resumeId}`);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
      router.push("/resumes");
    } finally {
      setDeleting(false);
    }
  }

  function handleDownload() {
    if (!resume) return;
    downloadResumePdf(resume.templateSlug, resume.content, resume.title);
  }

  if (loading || !resume) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-96 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      </div>
    );
  }

  const TemplateComponent = resume.templateSlug === "ats-friendly" ? AtsFriendlyTemplate : ModernTemplate;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/resumes" className="text-slate hover:text-bone" aria-label="Back">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-2xl font-bold text-bone">{resume.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/resumes/${resumeId}/edit`}
            className="flex items-center gap-1.5 rounded-xl border border-bone/15 bg-panel px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
          >
            <Pencil size={16} /> Edit Information
          </Link>
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-bone/15 bg-panel px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
          >
            <History size={16} /> History
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 rounded-xl border border-bone/15 bg-panel px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
          >
            <Copy size={16} /> Duplicate
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-dim"
          >
            <Download size={16} /> Download PDF
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete"
            className="rounded-xl border border-bone/15 bg-panel p-2 text-slate hover:border-red-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-bone/10 bg-slate/10 p-6">
        <TemplateComponent content={resume.content} />
      </div>

      <VersionHistoryDrawer
        resumeId={resumeId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestored={() => refetch()}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete this resume?"
        message="This will permanently delete the resume and all of its version history. This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
