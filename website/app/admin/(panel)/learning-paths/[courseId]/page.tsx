"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import SortableList from "@/components/admin/SortableList";
import AdminModulePanel from "@/components/admin/AdminModulePanel";
import AdminFileUpload from "@/components/admin/AdminFileUpload";
import { useAdminCourseDetail } from "@/hooks/useAdminCourseDetail";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import type { CourseStatus } from "@/types/admin";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const STATUS_STYLES: Record<CourseStatus, string> = {
  draft: "bg-panel-2 text-slate",
  published: "bg-teal-dim/20 text-teal",
  archived: "bg-red-400/10 text-red-400",
};

export default function AdminCourseEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: course, loading, refetch } = useAdminCourseDetail(courseId);
  const { data: categories } = useAdminCategories();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [icon, setIcon] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [savingModule, setSavingModule] = useState(false);

  useEffect(() => {
    if (!course) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(course.title);
    setTagline(course.tagline ?? "");
    setDescription(course.description);
    setDifficulty(course.difficulty);
    setIcon(course.icon);
    setCategoryId(course.category?.id ?? "");
    setTagsInput(course.tags.join(", "));
    setBannerUrl(course.bannerUrl);
    setThumbnailUrl(course.thumbnailUrl);
  }, [course]);

  async function handleSaveMeta() {
    setSavingMeta(true);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline: tagline || null,
          description,
          difficulty,
          icon,
          categoryId: categoryId || null,
          tags: tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          bannerUrl,
          thumbnailUrl,
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

  async function handleStatusChange(status: CourseStatus) {
    setSavingStatus(true);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update status.");
        return;
      }

      toast.success(`Learning path ${status}.`);
      refetch();
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    setSavingModule(true);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newModuleTitle }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to create module.");
        return;
      }

      toast.success("Module added.");
      setAddingModule(false);
      setNewModuleTitle("");
      refetch();
    } finally {
      setSavingModule(false);
    }
  }

  async function handleDeleteModule() {
    if (!deletingModuleId) return;
    setSavingModule(true);

    try {
      const res = await fetch(`/api/admin/modules/${deletingModuleId}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to delete module.");
        return;
      }

      toast.success("Module deleted.");
      setDeletingModuleId(null);
      refetch();
    } finally {
      setSavingModule(false);
    }
  }

  async function handleReorderModules(orderedIds: string[]) {
    const res = await fetch(`/api/admin/courses/${courseId}/modules/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    const json = await res.json();

    if (!json.success) {
      toast.error(json.message || "Failed to reorder modules.");
      return;
    }

    refetch();
  }

  if (loading || !course) {
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
            {course.title}
          </h1>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[course.status]}`}
          >
            {course.status}
          </span>
        </div>

        <div className="flex gap-3">
          {course.status !== "published" && (
            <button
              onClick={() => handleStatusChange("published")}
              disabled={savingStatus}
              className="rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
            >
              Publish
            </button>
          )}
          {course.status === "published" && (
            <button
              onClick={() => handleStatusChange("draft")}
              disabled={savingStatus}
              className="rounded-xl border border-bone/15 px-5 py-2.5 font-semibold text-bone disabled:opacity-60"
            >
              Unpublish
            </button>
          )}
          {course.status !== "archived" && (
            <button
              onClick={() => handleStatusChange("archived")}
              disabled={savingStatus}
              className="rounded-xl border border-red-400/30 px-5 py-2.5 font-semibold text-red-400 disabled:opacity-60"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminFileUpload label="Banner Image" value={bannerUrl} onChange={setBannerUrl} />
          <AdminFileUpload label="Thumbnail" value={thumbnailUrl} onChange={setThumbnailUrl} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[100px_1fr]">
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
          <label className="mb-1 block text-sm font-semibold text-slate">Tagline</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
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
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate">
            Tags (comma-separated)
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="react, frontend, beginner"
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
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

      <p className="mt-2 text-xs text-slate">Slug: {course.slug}</p>

      {/* Modules */}
      <div className="mt-8 rounded-3xl border border-amber/20 bg-panel p-7 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-slate">Modules</h2>

        {course.modules.length > 0 && (
          <SortableList
            items={course.modules}
            onReorder={handleReorderModules}
            renderItem={(mod) => (
              <AdminModulePanel
                module={mod}
                onChanged={refetch}
                onDeleteModule={setDeletingModuleId}
              />
            )}
          />
        )}

        {addingModule ? (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="Module title"
              className="flex-1 min-w-[200px] rounded-xl border border-bone/15 bg-panel px-4 py-2.5 text-bone outline-none focus:border-amber"
            />
            <button
              onClick={handleAddModule}
              disabled={savingModule}
              className="rounded-xl bg-amber px-5 py-2.5 font-semibold text-white"
            >
              Create
            </button>
            <button
              onClick={() => setAddingModule(false)}
              className="rounded-xl border border-bone/15 px-5 py-2.5 font-semibold text-bone"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingModule(true)}
            className="mt-4 flex items-center gap-2 rounded-xl border border-bone/15 px-5 py-2.5 font-semibold text-bone transition hover:border-amber"
          >
            <Plus size={16} />
            Add Module
          </button>
        )}
      </div>

      <ConfirmModal
        open={!!deletingModuleId}
        title="Delete this module?"
        message="Its lessons and quiz will be deleted too. This can't be undone."
        confirmText="Delete"
        loading={savingModule}
        onConfirm={handleDeleteModule}
        onCancel={() => setDeletingModuleId(null)}
      />
    </div>
  );
}
