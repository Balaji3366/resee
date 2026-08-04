"use client";

import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface DocumentAIPanelProps {
  summary: string;
  answer: string;
  quiz: string;
  interview: string;

  loadingSummary: boolean;
  loadingAnswer: boolean;
  loadingQuiz: boolean;
  loadingInterview: boolean;
}

const copyText = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.success("Copied!");
};

/**
 * Renamed from AIWorkspace.tsx — that name now belongs to the product's
 * unified AI Workspace surface (components/AIChat.tsx, /chat), which is
 * an unrelated system (docs/architecture/ai-workspace-architecture.md
 * §0's naming-collision finding). This component itself is unchanged:
 * still the Documents feature's AI-result panel (summary/answer/quiz/
 * interview-questions), still consumed only by app/documents/page.tsx.
 */
export default function DocumentAIPanel({
  summary,
  answer,
  quiz,
  interview,
  loadingSummary,
  loadingAnswer,
  loadingQuiz,
  loadingInterview,
}: DocumentAIPanelProps) {
  return (
    <>
      {(loadingSummary || loadingAnswer || loadingQuiz || loadingInterview) && (
        <div className="mb-8 animate-pulse rounded-[30px] border border-amber/20 bg-panel p-10 text-center shadow-[0_15px_50px_rgba(10,59,46,.08)]">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-amber/30 border-t-amber-dim" />

          <h3 className="text-3xl font-bold text-bone">RESEE AI is working...</h3>

          <p className="mt-4 text-slate">
            {loadingSummary && "Analyzing your PDF and preparing a concise summary..."}

            {loadingAnswer && "Reading your document and finding the best answer..."}

            {loadingQuiz && "Creating quiz questions from your document..."}

            {loadingInterview && "Generating interview questions..."}
          </p>
        </div>
      )}

      <div className="rounded-[30px] border border-amber/20 bg-panel p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)]">
        <h2 className="font-display mb-8 text-3xl font-bold text-bone">AI Insights</h2>

        {!summary && !answer && !quiz && !interview && (
          <div className="rounded-[28px] border-2 border-dashed border-amber/30 bg-ink p-14 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber to-amber-dim shadow-lg">
              <span className="text-5xl">📄</span>
            </div>

            <h3 className="text-2xl font-bold text-bone">AI Insights Await</h3>

            <p className="mt-4 text-slate">Select a document and choose an AI action.</p>

            <div className="mt-8 flex justify-center gap-4 text-sm text-slate">
              <span className="rounded-full bg-panel px-4 py-2 shadow">Upload PDF</span>

              <span>→</span>

              <span className="rounded-full bg-panel px-4 py-2 shadow">Choose Action</span>

              <span>→</span>

              <span className="rounded-full bg-panel px-4 py-2 shadow">AI Result</span>
            </div>
          </div>
        )}

        {/* Summary */}

        {summary && (
          <div className="mb-8 rounded-[28px] border border-amber/20 bg-panel p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-amber-dim">📄 Document Summary</h3>

              <button
                onClick={() => copyText(summary)}
                className="rounded-xl bg-gradient-to-r from-amber to-amber-dim px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
              >
                Copy
              </button>
            </div>

            <div className="prose prose-lg max-w-none text-bone">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Answer */}

        {answer && (
          <div className="mb-8 rounded-[28px] border border-amber/20 bg-panel p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-amber-dim">🤖 AI Answer</h3>

              <button
                onClick={() => copyText(answer)}
                className="rounded-xl bg-gradient-to-r from-amber to-amber-dim px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
              >
                Copy
              </button>
            </div>

            <div className="whitespace-pre-wrap rounded-2xl bg-panel p-6 text-[16px] leading-8 text-bone">
              {answer}
            </div>
          </div>
        )}

        {/* Quiz */}

        {quiz && (
          <div className="mb-8 rounded-[28px] border border-amber/20 bg-panel p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-amber-dim">📝 Quiz</h3>

              <button
                onClick={() => copyText(quiz)}
                className="rounded-xl bg-gradient-to-r from-amber to-amber-dim px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
              >
                Copy
              </button>
            </div>

            <div className="rounded-2xl bg-panel p-6">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 text-bone">{children}</p>,
                  h1: ({ children }) => (
                    <h1 className="font-display mb-5 text-2xl font-bold text-bone">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-display mb-4 text-xl font-bold text-amber-dim">
                      {children}
                    </h2>
                  ),
                  li: ({ children }) => <li className="text-bone">{children}</li>,
                  strong: ({ children }) => <strong className="text-amber-dim">{children}</strong>,
                }}
              >
                {quiz}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {interview && (
          <div className="rounded-[28px] border border-amber/20 bg-panel p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-amber-dim">🎤 Interview Questions</h3>

              <button
                onClick={() => copyText(interview)}
                className="rounded-xl bg-gradient-to-r from-amber to-amber-dim px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
              >
                Copy
              </button>
            </div>

            <div className="prose prose-lg max-w-none rounded-2xl bg-panel p-6 text-bone">
              <ReactMarkdown>{interview}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
