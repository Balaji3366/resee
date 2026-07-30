"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function ReportQuestionButton({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);

    try {
      const res = await fetch(`/api/practice/questions/${questionId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();

      if (json.success) {
        setReported(true);
        setOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={reported}
        title="Report this question"
        className="flex items-center gap-2 rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-slate transition hover:border-red-400/50 disabled:opacity-60"
      >
        <Flag size={16} />
        {reported ? "Reported" : "Report"}
      </button>

      <ConfirmModal
        open={open}
        title="Report this question?"
        message="Let us know something is wrong with this question — we'll take a look."
        confirmText="Report"
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
