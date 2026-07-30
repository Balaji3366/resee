"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import AdminMarkdownEditor from "./AdminMarkdownEditor";
import AdminFileUpload from "./AdminFileUpload";
import type { AdminAttachment, AdminLessonDetail } from "@/types/admin";

export interface LessonFormValues {
  slug: string;
  title: string;
  content: string;
  estimatedMinutes: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  notes: string | null;
  attachments: AdminAttachment[];
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminLessonEditor({
  lesson,
  onSave,
  onCancel,
  saving,
}: {
  lesson?: AdminLessonDetail;
  onSave: (values: LessonFormValues) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const slug = lesson?.slug ?? "";
  const [content, setContent] = useState(lesson?.content ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(lesson?.estimatedMinutes ?? 5);
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [pdfUrl, setPdfUrl] = useState<string | null>(lesson?.pdfUrl ?? null);
  const [notes, setNotes] = useState(lesson?.notes ?? "");
  const [attachments, setAttachments] = useState<AdminAttachment[]>(lesson?.attachments ?? []);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  function addAttachment() {
    if (!attachmentName.trim() || !attachmentUrl) return;
    setAttachments((prev) => [...prev, { name: attachmentName, url: attachmentUrl }]);
    setAttachmentName("");
    setAttachmentUrl(null);
  }

  function handleSave() {
    if (!title.trim() || !content.trim()) return;

    onSave({
      slug: slug.trim() || slugify(title),
      title,
      content,
      estimatedMinutes,
      videoUrl: videoUrl.trim() || null,
      pdfUrl,
      notes: notes.trim() || null,
      attachments,
    });
  }

  return (
    <div className="rounded-2xl border border-amber/20 bg-ink p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Lesson Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">
            Estimated Minutes
          </label>
          <input
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>
      </div>

      <div className="mt-4">
        <AdminMarkdownEditor value={content} onChange={setContent} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Video URL</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <AdminFileUpload label="PDF Upload" value={pdfUrl} onChange={setPdfUrl} accept="application/pdf" />
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold text-slate">Notes</label>
        <textarea
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
        />
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-semibold text-slate">Attachments</label>

        <div className="space-y-2">
          {attachments.map((a, i) => (
            <div
              key={`${a.url}-${i}`}
              className="flex items-center justify-between rounded-xl bg-panel px-4 py-2"
            >
              <span className="truncate text-sm text-bone">{a.name}</span>
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-slate hover:text-red-400"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <input
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Attachment name"
              className="w-full rounded-xl border border-bone/15 bg-panel px-3 py-2 text-sm text-bone outline-none focus:border-amber"
            />
          </div>

          <div className="min-w-[160px]">
            <AdminFileUpload
              label=""
              value={attachmentUrl}
              onChange={setAttachmentUrl}
              accept="*/*"
            />
          </div>

          <button
            type="button"
            onClick={addAttachment}
            className="flex items-center gap-1 rounded-xl border border-bone/15 px-4 py-2 text-sm font-semibold text-bone transition hover:border-amber"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl border border-bone/15 px-5 py-2.5 font-semibold text-bone"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-amber px-6 py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Lesson"}
        </button>
      </div>
    </div>
  );
}
