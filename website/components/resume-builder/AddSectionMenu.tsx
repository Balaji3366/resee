"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { RESUME_SECTION_LABELS, type ResumeSectionType } from "@/types/resume-builder";

const ALL_TYPES = Object.keys(RESUME_SECTION_LABELS) as ResumeSectionType[];

export default function AddSectionMenu({
  existingTypes,
  onAdd,
}: {
  existingTypes: ResumeSectionType[];
  onAdd: (type: ResumeSectionType) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = ALL_TYPES.filter((type) => !existingTypes.includes(type));

  if (available.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber/40 py-3 font-semibold text-amber transition hover:border-amber hover:bg-panel"
      >
        <Plus size={18} /> Add Section
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-10 mt-2 max-h-64 overflow-y-auto rounded-xl border border-amber/20 bg-panel p-2 shadow-2xl">
          {available.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-bone hover:bg-ink"
            >
              {RESUME_SECTION_LABELS[type]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
