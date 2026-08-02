"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import SortableList from "./SortableList";
import AdminInterviewQuestionEditor, {
  type InterviewQuestionFormValues,
} from "./AdminInterviewQuestionEditor";
import type { AdminInterviewQuestionDetail } from "@/types/admin";

export default function AdminInterviewQuestionList({
  setId,
  questions,
  onChanged,
}: {
  setId: string;
  questions: AdminInterviewQuestionDetail[];
  onChanged: () => void;
}) {
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAddQuestion(values: InterviewQuestionFormValues) {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/interviews/sets/${setId}/questions`, {
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

  async function handleEditQuestion(questionId: string, values: InterviewQuestionFormValues) {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/interviews/questions/${questionId}`, {
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
      const res = await fetch(`/api/admin/interviews/questions/${deletingQuestionId}`, {
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
    const res = await fetch(`/api/admin/interviews/sets/${setId}/questions/reorder`, {
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

  return (
    <div>
      {questions.length > 0 && (
        <SortableList
          items={questions}
          onReorder={handleReorderQuestions}
          renderItem={(q) =>
            editingQuestionId === q.id ? (
              <AdminInterviewQuestionEditor
                initial={q}
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

      {addingQuestion ? (
        <div className="mt-4">
          <AdminInterviewQuestionEditor
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
