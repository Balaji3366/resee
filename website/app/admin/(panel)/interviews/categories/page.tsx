"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { useAdminInterviewCategories } from "@/hooks/useAdminInterviewCategories";
import type { AdminInterviewCategory } from "@/types/admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminInterviewCategoriesPage() {
  const { data: categories, loading, refetch } = useAdminInterviewCategories();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<AdminInterviewCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminInterviewCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !icon.trim() || !description.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/interviews/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, description, slug: slugify(name) }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to create category.");
        return;
      }

      toast.success("Category created.");
      setName("");
      setIcon("");
      setDescription("");
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/interviews/categories/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          icon: editing.icon,
          description: editing.description,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update category.");
        return;
      }

      toast.success("Category updated.");
      setEditing(null);
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/interviews/categories/${deleting.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to delete category.");
        return;
      }

      toast.success("Category deleted.");
      setDeleting(null);
      refetch();
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
          Interview Categories
        </h1>
        <p className="mt-2 text-slate">Manage the categories used by Mock Interviews.</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-8 space-y-4 rounded-3xl border border-amber/20 bg-panel p-6 shadow-md"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-sm font-semibold text-slate">Icon (emoji)</label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🎤"
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>

          <div className="flex-[2] min-w-[220px]">
            <label className="mb-1 block text-sm font-semibold text-slate">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Behavioural"
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description shown to users"
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          <Plus size={18} />
          Add Category
        </button>
      </form>

      {loading && (
        <div className="h-40 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (
        <div className="space-y-3">
          {(categories ?? []).map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-amber/20 bg-panel p-5 shadow-md"
            >
              {editing?.id === category.id ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-end gap-4">
                    <input
                      value={editing.icon}
                      onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                      className="w-20 rounded-xl border border-bone/15 bg-panel px-3 py-2 text-center text-bone outline-none focus:border-amber"
                    />
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="flex-1 min-w-[180px] rounded-xl border border-bone/15 bg-panel px-3 py-2 text-bone outline-none focus:border-amber"
                    />
                  </div>
                  <input
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="w-full rounded-xl border border-bone/15 bg-panel px-3 py-2 text-bone outline-none focus:border-amber"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={submitting}
                      className="rounded-xl bg-amber px-5 py-2 font-semibold text-white transition hover:bg-amber-dim"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-xl border border-bone/15 px-5 py-2 font-semibold text-bone"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-semibold text-bone">{category.name}</p>
                      <p className="text-xs text-slate">{category.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(category)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-bone/15 text-slate transition hover:border-amber hover:text-amber"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(category)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-bone/15 text-slate transition hover:border-red-400/50 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Delete this category?"
        message={`"${deleting?.name}" will be permanently removed. This can't be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
