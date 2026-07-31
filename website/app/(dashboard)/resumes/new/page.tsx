"use client";

import ResumeWizard from "@/components/resume-builder/wizard/ResumeWizard";

export default function NewResumePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">Create Resume</h1>
        <p className="mt-2 text-slate">
          Answer a few questions and ReSee will automatically generate a professional, ATS-ready
          resume for you.
        </p>
      </div>

      <ResumeWizard mode="create" />
    </div>
  );
}
