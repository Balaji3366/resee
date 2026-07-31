"use client";

import { use } from "react";
import ResumeWizard from "@/components/resume-builder/wizard/ResumeWizard";
import { useResumeDetail } from "@/hooks/useResumeDetail";

export default function EditResumePage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = use(params);
  const { data: resume, loading } = useResumeDetail(resumeId);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          Edit Information
        </h1>
        <p className="mt-2 text-slate">Update your answers — ReSee will regenerate your resume.</p>
      </div>

      {loading ? (
        <div className="h-96 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      ) : resume ? (
        <ResumeWizard mode="edit" resumeId={resumeId} initialContent={resume.content} />
      ) : (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
          Couldn&apos;t find this resume.
        </div>
      )}
    </div>
  );
}
