"use client";

import { useState } from "react";
import { X, History, RotateCcw, GitCompare, Sparkles } from "lucide-react";
import { useResumeVersions } from "@/hooks/useResumeVersions";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import { useFeatureFlag } from "@/components/providers/FeatureFlagsProvider";
import type { ResumeContent } from "@/types/resume-builder";
import type { ResumeVersionDiff } from "@/lib/resumeVersionDiff";
import type { ResumeVersionComparisonResult } from "@/lib/ai/prompts/resumeVersionComparison";

interface CompareResult {
  diff: ResumeVersionDiff;
  beforeVersionNumber: number;
  afterVersionNumber: number;
  aiSummary: ResumeVersionComparisonResult | null;
}

function DiffSummary({ result }: { result: CompareResult }) {
  const { diff, beforeVersionNumber, afterVersionNumber } = result;

  if (!diff.hasChanges) {
    return (
      <p className="text-sm text-slate">
        No differences between version {beforeVersionNumber} and version {afterVersionNumber}.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 text-sm">
      <p className="mb-2 font-semibold text-bone">
        Version {beforeVersionNumber} → Version {afterVersionNumber}
      </p>
      {diff.summaryChanged && <p className="text-slate">• Professional summary changed</p>}
      {diff.skillsAdded.length > 0 && (
        <p className="text-slate">• Skills added: {diff.skillsAdded.join(", ")}</p>
      )}
      {diff.skillsRemoved.length > 0 && (
        <p className="text-slate">• Skills removed: {diff.skillsRemoved.join(", ")}</p>
      )}
      {diff.experienceBulletsChanged.map((item, i) => (
        <p key={i} className="text-slate">
          • Bullet points updated for {item.role} at {item.company}
        </p>
      ))}
      {diff.educationCountDelta !== 0 && (
        <p className="text-slate">
          • Education entries {diff.educationCountDelta > 0 ? "added" : "removed"} (
          {Math.abs(diff.educationCountDelta)})
        </p>
      )}
      {diff.projectsCountDelta !== 0 && (
        <p className="text-slate">
          • Project entries {diff.projectsCountDelta > 0 ? "added" : "removed"} (
          {Math.abs(diff.projectsCountDelta)})
        </p>
      )}
      {diff.certificationsCountDelta !== 0 && (
        <p className="text-slate">
          • Certification entries {diff.certificationsCountDelta > 0 ? "added" : "removed"} (
          {Math.abs(diff.certificationsCountDelta)})
        </p>
      )}
    </div>
  );
}

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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const analysisEnabled = useFeatureFlag("aiResumeAnalysis");

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

  function toggleSelected(versionId: string) {
    setCompareResult(null);
    setSelectedIds((prev) => {
      if (prev.includes(versionId)) return prev.filter((id) => id !== versionId);
      if (prev.length >= 2) return [prev[1], versionId];
      return [...prev, versionId];
    });
  }

  async function runCompare(includeAiSummary: boolean) {
    if (selectedIds.length !== 2) return;

    if (includeAiSummary) setLoadingAiSummary(true);
    else setComparing(true);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionAId: selectedIds[0],
          versionBId: selectedIds[1],
          includeAiSummary,
        }),
      });
      const json = await res.json();
      if (json.success) setCompareResult(json);
    } finally {
      setComparing(false);
      setLoadingAiSummary(false);
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

        <button
          onClick={() => {
            setCompareMode((v) => !v);
            setSelectedIds([]);
            setCompareResult(null);
          }}
          className="mt-4 flex items-center gap-1.5 self-start rounded-lg border border-bone/15 px-3 py-1.5 text-xs font-semibold text-bone hover:bg-ink"
        >
          <GitCompare size={14} />
          {compareMode ? "Cancel Compare" : "Compare Versions"}
        </button>

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
                <div className="flex items-center gap-3">
                  {compareMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(version.id)}
                      onChange={() => toggleSelected(version.id)}
                      className="h-4 w-4 accent-amber"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-bone">Version {version.versionNumber}</p>
                    <p className="text-xs text-slate">
                      {new Date(version.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!compareMode && (
                  <button
                    onClick={() => handleRestore(version.id)}
                    disabled={restoringId !== null}
                    className="flex items-center gap-1 rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10 disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    {restoringId === version.id ? "Restoring..." : "Restore"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {compareMode && selectedIds.length === 2 && !compareResult && (
          <button
            onClick={() => runCompare(false)}
            disabled={comparing}
            className="mt-3 rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-dim disabled:opacity-50"
          >
            {comparing ? "Comparing..." : "Compare Selected"}
          </button>
        )}

        {compareResult && (
          <div className="mt-4 space-y-3 rounded-xl border border-bone/10 bg-ink p-4">
            <DiffSummary result={compareResult} />

            {analysisEnabled && compareResult.diff.hasChanges && !compareResult.aiSummary && (
              <button
                onClick={() => runCompare(true)}
                disabled={loadingAiSummary}
                className="flex items-center gap-1.5 rounded-lg border border-amber/30 px-3 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10 disabled:opacity-50"
              >
                <Sparkles size={14} />
                {loadingAiSummary ? "Summarizing..." : "Get AI Summary"}
              </button>
            )}

            {compareResult.aiSummary && (
              <div className="space-y-2 border-t border-bone/10 pt-3">
                <AIDisclosureBadge />
                <p className="text-sm text-bone">{compareResult.aiSummary.summary}</p>
                {compareResult.aiSummary.improvements.length > 0 && (
                  <ul className="space-y-1 text-sm text-slate">
                    {compareResult.aiSummary.improvements.map((s, i) => (
                      <li key={i}>+ {s}</li>
                    ))}
                  </ul>
                )}
                {compareResult.aiSummary.regressions.length > 0 && (
                  <ul className="space-y-1 text-sm text-slate">
                    {compareResult.aiSummary.regressions.map((s, i) => (
                      <li key={i}>− {s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
