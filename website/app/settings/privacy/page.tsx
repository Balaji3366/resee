"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import { toastSuccess, toastError } from "@/lib/toast";

export default function PrivacySettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAIHistory() {
    setDeleting(true);

    try {
      const res = await fetch("/api/settings/privacy/ai-history", { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete AI history.");
      }

      toastSuccess("Your AI history has been permanently deleted.");
      setConfirmOpen(false);
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to delete AI history.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <OnboardingLayout>
        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Settings
        </Link>

        <h2 className="font-display text-3xl font-extrabold text-bone">Privacy</h2>

        <p className="mt-3 text-slate">Manage what ReSee&apos;s AI features remember about you.</p>

        <div className="mt-8 rounded-2xl border border-amber/20 bg-panel-2 p-6">
          <h3 className="text-lg font-semibold text-bone">AI History</h3>

          <p className="mt-2 text-sm text-slate">
            ReSee&apos;s AI features keep a short record of your requests (request logs, cached
            responses, your saved career-context snapshot, and any AI chat conversations) to make
            them faster and more relevant. Request logs are automatically deleted after 60 days
            regardless — only anonymized, aggregated analytics survive past that point. Your AI
            credit and billing history is not affected by this action and is always retained.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-5 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => setConfirmOpen(true)}
          >
            Delete My AI History
          </Button>
        </div>
      </OnboardingLayout>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete your AI history?"
        description="This permanently deletes your AI request logs, cached AI responses, your saved career-context snapshot, and your AI chat conversations. This cannot be undone. Your credit balance and billing history are not affected."
        confirmLabel="Delete Permanently"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDeleteAIHistory}
      />
    </>
  );
}
