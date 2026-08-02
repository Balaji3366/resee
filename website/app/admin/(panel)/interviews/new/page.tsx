"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminInterviewCategories } from "@/hooks/useAdminInterviewCategories";
import { useAdminInterviewRoles } from "@/hooks/useAdminInterviewRoles";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EXPERIENCE_LEVELS = ["fresher", "1-3-years", "3-5-years", "5-plus-years"];

export default function NewInterviewSetPage() {
  const router = useRouter();
  const { data: categories } = useAdminInterviewCategories();
  const { data: roles } = useAdminInterviewRoles();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !categoryId || !roleId) {
      toast.error("Title, description, category, and role are required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/interviews/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: `${slugify(title)}-${experienceLevel}`,
          title,
          description,
          categoryId,
          roleId,
          experienceLevel,
          estimatedMinutes,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to create interview set.");
        return;
      }

      toast.success("Interview set created — now add questions.");
      router.push(`/admin/interviews/${json.setId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          New Interview Set
        </h1>
        <p className="mt-2 text-slate">Starts hidden — mark it available once it has questions.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-amber/20 bg-panel p-8 shadow-md"
      >
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer — Technical"
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              <option value="">Select…</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              <option value="">Select…</option>
              {(roles ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
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
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Interview Set"}
        </button>
      </form>
    </div>
  );
}
