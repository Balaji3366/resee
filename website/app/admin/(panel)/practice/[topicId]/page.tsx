"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminPracticeQuestionList from "@/components/admin/AdminPracticeQuestionList";
import { useAdminPracticeTopicDetail } from "@/hooks/useAdminPracticeTopicDetail";
import { useAdminPracticeCategories } from "@/hooks/useAdminPracticeCategories";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function AdminPracticeTopicEditorPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = use(params);
  const { data: topic, loading, refetch } = useAdminPracticeTopicDetail(topicId);
  const { data: categories } = useAdminPracticeCategories();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [icon, setIcon] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    if (!topic) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(topic.title);
    setDescription(topic.description);
    setDifficulty(topic.difficulty);
    setIcon(topic.icon);
    setCategoryId(topic.category?.id ?? "");
    setEstimatedMinutes(topic.estimatedMinutes);
  }, [topic]);

  async function handleSaveMeta() {
    setSavingMeta(true);

    try {
      const res = await fetch(`/api/admin/practice/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          icon,
          categoryId: categoryId || null,
          estimatedMinutes,
        }),
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
    if (!topic) return;
    setSavingAvailability(true);

    try {
      const res = await fetch(`/api/admin/practice/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !topic.isAvailable }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update availability.");
        return;
      }

      toast.success(topic.isAvailable ? "Topic hidden." : "Topic published.");
      refetch();
    } finally {
      setSavingAvailability(false);
    }
  }

  if (loading || !topic) {
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
            {topic.title}
          </h1>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              topic.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
            }`}
          >
            {topic.isAvailable ? "Available" : "Draft"}
          </span>
        </div>

        <button
          onClick={handleToggleAvailability}
          disabled={savingAvailability}
          className={
            topic.isAvailable
              ? "rounded-xl border border-red-400/30 px-5 py-2.5 font-semibold text-red-400 disabled:opacity-60"
              : "rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
          }
        >
          {topic.isAvailable ? "Hide Topic" : "Publish Topic"}
        </button>
      </div>

      {/* Metadata */}
      <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Details</h2>

        <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Icon</label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
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

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
            <label className="mb-1 block text-sm font-semibold text-slate">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              <option value="">None</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Est. Minutes</label>
            <input
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
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

      <p className="mt-2 text-xs text-slate">Slug: {topic.slug}</p>

      {/* Questions */}
      <div className="mt-8 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Questions</h2>
        <AdminPracticeQuestionList
          topicId={topicId}
          questions={topic.questions}
          onChanged={refetch}
        />
      </div>
    </div>
  );
}
