"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import SortableList from "./SortableList";
import AdminQuestionEditor, { type QuestionFormValues } from "./AdminQuestionEditor";
import type { AdminQuizDetail } from "@/types/admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminQuizPanel({
  moduleId,
  quiz,
  onChanged,
}: {
  moduleId: string;
  quiz: AdminQuizDetail | null;
  onChanged: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreateQuiz() {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugify(title), title }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to create quiz.");
        return;
      }

      toast.success("Quiz created.");
      setCreating(false);
      setTitle("");
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddQuestion(values: QuestionFormValues) {
    if (!quiz) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to add question.");
        return;
      }

      toast.success("Question added.");
      setAddingQuestion(false);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleEditQuestion(questionId: string, values: QuestionFormValues) {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/quiz-questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update question.");
        return;
      }

      toast.success("Question updated.");
      setEditingQuestionId(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion() {
    if (!deletingQuestionId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/quiz-questions/${deletingQuestionId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to delete question.");
        return;
      }

      toast.success("Question deleted.");
      setDeletingQuestionId(null);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleReorderQuestions(orderedIds: string[]) {
    if (!quiz) return;

    const res = await fetch(`/api/admin/quizzes/${quiz.id}/questions/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    const json = await res.json();

    if (!json.success) {
      toast.error(json.message || "Failed to reorder questions.");
      return;
    }

    onChanged();
  }

  if (!quiz) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-bone/15 p-4">
        {creating ? (
          <div className="flex flex-wrap items-end gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz title"
              className="flex-1 min-w-[200px] rounded-xl border border-bone/15 bg-panel px-4 py-2.5 text-bone outline-none focus:border-amber"
            />
            <button
              onClick={handleCreateQuiz}
              disabled={saving}
              className="rounded-xl bg-amber px-5 py-2.5 font-semibold text-white"
            >
              Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-xl border border-bone/15 px-5 py-2.5 font-semibold text-bone"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 text-sm font-semibold text-amber"
          >
            <Plus size={16} />
            Add a quiz to this module
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-bone/10 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-bone">{quiz.title}</p>
        <span className="text-xs text-slate">Pass: {quiz.passingScore}%</span>
      </div>

      <div className="mt-4">
        {quiz.questions.length > 0 && (
          <SortableList
            items={quiz.questions}
            onReorder={handleReorderQuestions}
            renderItem={(q) =>
              editingQuestionId === q.id ? (
                <AdminQuestionEditor
                  initial={q}
                  allowedTypes={["single_choice", "multiple_select", "fill_blank"]}
                  saving={saving}
                  onCancel={() => setEditingQuestionId(null)}
                  onSave={(values) => handleEditQuestion(q.id, values)}
                />
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-bone/10 bg-ink px-4 py-3">
                  <span className="truncate text-sm text-bone">{q.question}</span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setEditingQuestionId(q.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-bone/15 text-slate hover:border-amber hover:text-amber"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingQuestionId(q.id)}
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
      </div>

      {addingQuestion ? (
        <div className="mt-4">
          <AdminQuestionEditor
            allowedTypes={["single_choice", "multiple_select", "fill_blank"]}
            saving={saving}
            onCancel={() => setAddingQuestion(false)}
            onSave={handleAddQuestion}
          />
        </div>
      ) : (
        <button
          onClick={() => setAddingQuestion(true)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber"
        >
          <Plus size={16} />
          Add Question
        </button>
      )}

      <ConfirmModal
        open={!!deletingQuestionId}
        title="Delete this question?"
        message="This can't be undone."
        loading={saving}
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeletingQuestionId(null)}
      />
    </div>
  );
}
