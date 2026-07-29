"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim();

    if (!trimmed || values.includes(trimmed)) return;

    onChange([...values, trimmed]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  return (
    <div>
      <div className="flex h-14 items-center gap-2 rounded-xl border border-bone/15 px-4 transition focus-within:border-amber">
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            }
          }}
          className="w-full bg-transparent text-bone placeholder:text-slate outline-none"
        />
      </div>

      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="flex items-center gap-2 rounded-full bg-panel px-4 py-1.5 text-sm font-medium text-amber"
            >
              {value}
              <button type="button" onClick={() => removeTag(value)}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions
          .filter((s) => !values.includes(s))
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full border border-bone/15 px-4 py-1.5 text-sm text-slate transition hover:border-amber hover:text-bone"
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );
}
