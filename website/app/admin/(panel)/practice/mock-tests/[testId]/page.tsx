"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import SortableList from "@/components/admin/SortableList";
import AdminMockTestQuestionPicker from "@/components/admin/AdminMockTestQuestionPicker";
import { useAdminMockTestDetail } from "@/hooks/useAdminMockTestDetail";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function AdminMockTestEditorPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = use(params);
  const { data: test, loading, refetch } = useAdminMockTestDetail(testId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [removingLinkId, setRemovingLinkId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!test) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(test.title);
    setDescription(test.description);
    setDifficulty(test.difficulty);
    setDurationMinutes(test.durationMinutes);
  }, [test]);

  async function handleSaveMeta() {
    setSavingMeta(true);

    try {
      const res = await fetch(`/api/admin/practice/mock-tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, difficulty, durationMinutes }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to save changes.");
        return;
      }

      toast.success("Saved.");
      refetch();
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleToggleAvailability() {
    if (!test) return;
    setSavingAvailability(true);

    try {
      const res = await fetch(`/api/admin/practice/mock-tests/${testId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !test.isAvailable }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update availability.");
        return;
      }

      toast.success(test.isAvailable ? "Mock test hidden." : "Mock test published.");
      refetch();
    } finally {
      setSavingAvailability(false);
    }
  }

  async function handleReorder(orderedIds: string[]) {
    const res = await fetch(`/api/admin/practice/mock-tests/${testId}/questions/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    const json = await res.json();

    if (!json.success) {
      toast.error(json.message || "Failed to reorder questions.");
      return;
    }

    refetch();
  }

  async function handleRemove() {
    if (!removingLinkId) return;
    setRemoving(true);

    try {
      const res = await fetch(
        `/api/admin/practice/mock-tests/${testId}/questions/${removingLinkId}`,
        { method: "DELETE" }
      );
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to remove question.");
        return;
      }

      toast.success("Question removed.");
      setRemovingLinkId(null);
      refetch();
    } finally {
      setRemoving(false);
    }
  }

  if (loading || !test) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            {test.title}
          </h1>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              test.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
            }`}
          >
            {test.isAvailable ? "Available" : "Draft"}
          </span>
        </div>

        <button
          onClick={handleToggleAvailability}
          disabled={savingAvailability}
          className={
            test.isAvailable
              ? "rounded-xl border border-red-400/30 px-5 py-2.5 font-semibold text-red-400 disabled:opacity-60"
              : "rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
          }
        >
          {test.isAvailable ? "Hide Test" : "Publish Test"}
        </button>
      </div>

      {/* Metadata */}
      <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Details</h2>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="capitalize">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
        </div>

        <button
          onClick={handleSaveMeta}
          disabled={savingMeta}
          className="mt-6 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {savingMeta ? "Saving..." : "Save Details"}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate">Slug: {test.slug}</p>

      {/* Questions */}
      <div className="mt-8 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">
          Questions ({test.questions.length})
        </h2>

        {test.questions.length > 0 && (
          <SortableList
            items={test.questions.map((q) => ({ ...q, id: q.linkId }))}
            onReorder={handleReorder}
            renderItem={(q) => (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-bone/10 bg-ink px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-bone">{q.question}</p>
                  <p className="text-xs text-slate">{q.topicTitle}</p>
                </div>

                <button
                  onClick={() => setRemovingLinkId(q.linkId)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bone/15 text-slate hover:border-red-400/50 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
        )}

        <div className="mt-4">
          <AdminMockTestQuestionPicker testId={testId} onAdded={refetch} />
        </div>
      </div>

      <ConfirmModal
        open={!!removingLinkId}
        title="Remove this question from the test?"
        message="The question stays in its topic's bank — this only removes it from this mock test."
        confirmText="Remove"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemovingLinkId(null)}
      />
    </div>
  );
}
