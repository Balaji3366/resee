"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AdminMarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate">
          Content (Markdown)
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 font-mono text-sm text-bone outline-none focus:border-amber"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate">Live Preview</label>
        <div className="prose prose-neutral h-[26rem] max-w-none overflow-y-auto rounded-xl border border-bone/15 bg-ink p-4 text-bone prose-headings:font-display prose-headings:text-bone prose-a:text-amber prose-code:text-amber prose-pre:bg-panel-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "*Nothing yet*"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
