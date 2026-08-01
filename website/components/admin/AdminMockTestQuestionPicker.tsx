"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";

interface SearchResult {
  id: string;
  question: string;
  topicTitle: string;
}

/**
 * Searches the whole practice_questions bank (across all topics) and
 * lets an admin assign an existing question to a mock test — mock
 * tests never author their own question content, only reference the
 * shared bank (see mock_test_questions in
 * supabase/migrations/0004_practice_module.sql).
 */
export default function AdminMockTestQuestionPicker({
  testId,
  onAdded,
}: {
  testId: string;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const url = query
          ? `/api/admin/practice/mock-tests/${testId}/questions?q=${encodeURIComponent(query)}`
          : `/api/admin/practice/mock-tests/${testId}/questions`;

        const res = await fetch(url);
        const json = await res.json();

        if (json.success) setResults(json.questions);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, testId]);

  async function handleAdd(questionId: string) {
    setAddingId(questionId);

    try {
      const res = await fetch(`/api/admin/practice/mock-tests/${testId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to add question.");
        return;
      }

      toast.success("Question added.");
      onAdded();
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-bone/15 p-4">
      <div className="flex items-center gap-2 rounded-xl border border-bone/15 bg-panel px-4 py-2.5">
        <Search size={16} className="text-slate" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions across all topics…"
          className="w-full bg-transparent text-bone outline-none placeholder:text-slate"
        />
      </div>

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {loading && <p className="text-sm text-slate">Searching…</p>}

        {!loading &&
          results.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-bone/10 bg-ink px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-bone">{result.question}</p>
                <p className="text-xs text-slate">{result.topicTitle}</p>
              </div>

              <button
                onClick={() => handleAdd(result.id)}
                disabled={addingId === result.id}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-bone/15 px-3 py-1.5 text-xs font-semibold text-bone transition hover:border-amber hover:text-amber disabled:opacity-60"
              >
                <Plus size={12} />
                Add
              </button>
            </div>
          ))}

        {!loading && results.length === 0 && (
          <p className="text-sm text-slate">No questions found.</p>
        )}
      </div>
    </div>
  );
}
