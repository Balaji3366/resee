"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { useAdminInterviewRoles } from "@/hooks/useAdminInterviewRoles";
import type { AdminInterviewRole } from "@/types/admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminInterviewRolesPage() {
  const { data: roles, loading, refetch } = useAdminInterviewRoles();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<AdminInterviewRole | null>(null);
  const [deleting, setDeleting] = useState<AdminInterviewRole | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !icon.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/interviews/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, slug: slugify(name) }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to create role.");
        return;
      }

      toast.success("Role created.");
      setName("");
      setIcon("");
      refetch();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/interviews/roles/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name, icon: editing.icon }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update role.");
        return;
      }

      toast.success("Role updated.");
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
      const res = await fetch(`/api/admin/interviews/roles/${deleting.id}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to delete role.");
        return;
      }

      toast.success("Role deleted.");
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
          Interview Roles
        </h1>
        <p className="mt-2 text-slate">Manage the roles used by Mock Interviews.</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-8 flex flex-wrap items-end gap-4 rounded-3xl border border-amber/20 bg-panel p-6 shadow-md"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1 block text-sm font-semibold text-slate">Icon (emoji)</label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="💻"
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div className="flex-[2] min-w-[220px]">
          <label className="mb-1 block text-sm font-semibold text-slate">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile Developer"
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          <Plus size={18} />
          Add Role
        </button>
      </form>

      {loading && (
        <div className="h-40 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (
        <div className="space-y-3">
          {(roles ?? []).map((role) => (
            <div
              key={role.id}
              className="rounded-2xl border border-amber/20 bg-panel p-5 shadow-md"
            >
              {editing?.id === role.id ? (
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
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <p className="font-semibold text-bone">{role.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(role)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-bone/15 text-slate transition hover:border-amber hover:text-amber"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(role)}
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
        title="Delete this role?"
        message={`"${deleting?.name}" will be permanently removed. This can't be undone.`}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
