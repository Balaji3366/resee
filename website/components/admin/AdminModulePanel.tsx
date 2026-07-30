"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import SortableList from "./SortableList";
import AdminLessonEditor, { type LessonFormValues } from "./AdminLessonEditor";
import AdminQuizPanel from "./AdminQuizPanel";
import type { AdminModuleDetail } from "@/types/admin";

export default function AdminModulePanel({
  module: mod,
  onChanged,
  onDeleteModule,
}: {
  module: AdminModuleDetail;
  onChanged: () => void;
  onDeleteModule: (moduleId: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [description, setDescription] = useState(mod.description ?? "");
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveModuleMeta() {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || null }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update module.");
        return;
      }

      toast.success("Module updated.");
      setEditingTitle(false);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLesson(values: LessonFormValues) {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/modules/${mod.id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to create lesson.");
        return;
      }

      toast.success("Lesson added.");
      setAddingLesson(false);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleEditLesson(lessonId: string, values: LessonFormValues) {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update lesson.");
        return;
      }

      toast.success("Lesson updated.");
      setEditingLessonId(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLesson() {
    if (!deletingLessonId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/lessons/${deletingLessonId}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to delete lesson.");
        return;
      }

      toast.success("Lesson deleted.");
      setDeletingLessonId(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleReorderLessons(orderedIds: string[]) {
    const res = await fetch(`/api/admin/modules/${mod.id}/lessons/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    const json = await res.json();

    if (!json.success) {
      toast.error(json.message || "Failed to reorder lessons.");
      return;
    }

    onChanged();
  }

  return (
    <div className="rounded-2xl border border-amber/20 bg-panel p-6 shadow-md">
      {editingTitle ? (
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-2.5 font-semibold text-bone outline-none focus:border-amber"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-2.5 text-sm text-bone outline-none focus:border-amber"
          />
          <div className="flex gap-3">
            <button
              onClick={handleSaveModuleMeta}
              disabled={saving}
              className="rounded-xl bg-amber px-5 py-2 font-semibold text-white"
            >
              Save
            </button>
            <button
              onClick={() => setEditingTitle(false)}
              className="rounded-xl border border-bone/15 px-5 py-2 font-semibold text-bone"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-bone">{mod.title}</h3>
            {mod.description && <p className="mt-1 text-sm text-slate">{mod.description}</p>}
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setEditingTitle(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-bone/15 text-slate hover:border-amber hover:text-amber"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDeleteModule(mod.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-bone/15 text-slate hover:border-red-400/50 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-slate">Lessons</p>

        {mod.lessons.length > 0 && (
          <SortableList
            items={mod.lessons}
            onReorder={handleReorderLessons}
            renderItem={(lesson) =>
              editingLessonId === lesson.id ? (
                <AdminLessonEditor
                  lesson={lesson}
                  saving={saving}
                  onCancel={() => setEditingLessonId(null)}
                  onSave={(values) => handleEditLesson(lesson.id, values)}
                />
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-bone/10 bg-ink px-4 py-3">
                  <span className="truncate text-sm font-medium text-bone">{lesson.title}</span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setEditingLessonId(lesson.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-bone/15 text-slate hover:border-amber hover:text-amber"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingLessonId(lesson.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-bone/15 text-slate hover:border-red-400/50 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            }
          />
        )}

        {addingLesson ? (
          <div className="mt-3">
            <AdminLessonEditor
              saving={saving}
              onCancel={() => setAddingLesson(false)}
              onSave={handleAddLesson}
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingLesson(true)}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-amber"
          >
            <Plus size={16} />
            Add Lesson
          </button>
        )}
      </div>

      <div>
        <p className="mb-1 mt-5 text-sm font-semibold text-slate">Quiz</p>
        <AdminQuizPanel moduleId={mod.id} quiz={mod.quiz} onChanged={onChanged} />
      </div>

      <ConfirmModal
        open={!!deletingLessonId}
        title="Delete this lesson?"
        message="This can't be undone."
        loading={saving}
        onConfirm={handleDeleteLesson}
        onCancel={() => setDeletingLessonId(null)}
      />
    </div>
  );
}
