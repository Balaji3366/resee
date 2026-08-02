"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminInterviewQuestionList from "@/components/admin/AdminInterviewQuestionList";
import { useAdminInterviewSetDetail } from "@/hooks/useAdminInterviewSetDetail";

export default function AdminInterviewSetEditorPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = use(params);
  const { data: set, loading, refetch } = useAdminInterviewSetDetail(setId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    if (!set) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(set.title);
    setDescription(set.description);
    setEstimatedMinutes(set.estimatedMinutes);
  }, [set]);

  async function handleSaveMeta() {
    setSavingMeta(true);

    try {
      const res = await fetch(`/api/admin/interviews/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, estimatedMinutes }),
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
    if (!set) return;
    setSavingAvailability(true);

    try {
      const res = await fetch(`/api/admin/interviews/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !set.isAvailable }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update availability.");
        return;
      }

      toast.success(set.isAvailable ? "Set hidden." : "Set published.");
      refetch();
    } finally {
      setSavingAvailability(false);
    }
  }

  if (loading || !set) {
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
            {set.title}
          </h1>
          <p className="mt-2 text-sm text-slate">
            {set.category ? `${set.category.icon} ${set.category.name}` : "—"} ·{" "}
            {set.role ? `${set.role.icon} ${set.role.name}` : "—"} · {set.experienceLevel}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              set.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
            }`}
          >
            {set.isAvailable ? "Available" : "Draft"}
          </span>
        </div>

        <button
          onClick={handleToggleAvailability}
          disabled={savingAvailability}
          className={
            set.isAvailable
              ? "rounded-xl border border-red-400/30 px-5 py-2.5 font-semibold text-red-400 disabled:opacity-60"
              : "rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
          }
        >
          {set.isAvailable ? "Hide Set" : "Publish Set"}
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

        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate">Est. Minutes</label>
          <input
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full max-w-[160px] rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <button
          onClick={handleSaveMeta}
          disabled={savingMeta}
          className="mt-6 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {savingMeta ? "Saving..." : "Save Details"}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate">Slug: {set.slug}</p>

      {/* Questions */}
      <div className="mt-8 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Questions</h2>
        <AdminInterviewQuestionList setId={setId} questions={set.questions} onChanged={refetch} />
      </div>
    </div>
  );
}
