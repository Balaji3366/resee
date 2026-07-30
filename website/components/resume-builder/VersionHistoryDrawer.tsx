"use client";

import { useState } from "react";
import { X, History, RotateCcw } from "lucide-react";
import { useResumeVersions } from "@/hooks/useResumeVersions";
import type { ResumeContent } from "@/types/resume-builder";

export default function VersionHistoryDrawer({
  resumeId,
  open,
  onClose,
  onRestored,
}: {
  resumeId: string;
  open: boolean;
  onClose: () => void;
  onRestored: (content: ResumeContent) => void;
}) {
  const { data, loading, restore } = useResumeVersions(resumeId);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (!open) return null;

  async function handleRestore(versionId: string) {
    setRestoringId(versionId);
    try {
      const content = await restore(versionId);
      onRestored(content);
      onClose();
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col bg-panel p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-bone">
            <History size={20} /> Version History
          </h2>
          <button onClick={onClose} className="text-slate hover:text-bone" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-slate">Loading versions...</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-slate">
              No saved versions yet. Versions appear here automatically as you edit.
            </p>
          ) : (
            data.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded-xl border border-bone/10 bg-ink px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-bone">Version {version.versionNumber}</p>
                  <p className="text-xs text-slate">{new Date(version.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleRestore(version.id)}
                  disabled={restoringId !== null}
                  className="flex items-center gap-1 rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10 disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  {restoringId === version.id ? "Restoring..." : "Restore"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
