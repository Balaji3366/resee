"use client";

import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AIWorkspaceProps {
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

export default function AIWorkspace({
  summary,
  answer,
  quiz,
  interview,
  loadingSummary,
  loadingAnswer,
  loadingQuiz,
  loadingInterview,
}: AIWorkspaceProps) {
  return (
    <>
      {(loadingSummary ||
  loadingAnswer ||
  loadingQuiz ||
  loadingInterview) && (
  <div className="mb-8 animate-pulse rounded-[30px] border border-[#D4AF37]/20 bg-[#EEF7F2] p-10 text-center shadow-[0_15px_50px_rgba(10,59,46,.08)]">

    <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37]/30 border-t-[#14532D]" />

    <h3 className="text-3xl font-bold text-[#06281F]">
      Mentora AI is working...
    </h3>

    <p className="mt-4 text-gray-600">
      {loadingSummary &&
        "Analyzing your PDF and preparing a concise summary..."}

      {loadingAnswer &&
        "Reading your document and finding the best answer..."}

      {loadingQuiz &&
        "Creating quiz questions from your document..."}

      {loadingInterview &&
        "Generating interview questions..."}

    </p>

  </div>
)}

      <div className="rounded-[30px] border border-[#D4AF37]/20 bg-white p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)]">
        <h2 className="mb-8 text-3xl font-bold text-[#06281F]">
        AI Insights
        </h2>

        {!summary && !answer && !quiz && !interview && (
  <div className="rounded-[28px] border-2 border-dashed border-[#D4AF37]/30 bg-[#F8FAF8] p-14 text-center">

    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0A3B2E] to-[#14532D] shadow-lg">
      <span className="text-5xl">📄</span>
    </div>

    <h3 className="text-2xl font-bold text-[#06281F]">
      AI Insights Await
    </h3>

    <p className="mt-4 text-gray-600">
      Select a document and choose an AI action.
    </p>

    <div className="mt-8 flex justify-center gap-4 text-sm text-gray-500">
      <span className="rounded-full bg-white px-4 py-2 shadow">
        Upload PDF
      </span>

      <span>→</span>

      <span className="rounded-full bg-white px-4 py-2 shadow">
        Choose Action
      </span>

      <span>→</span>

      <span className="rounded-full bg-white px-4 py-2 shadow">
        AI Result
      </span>
    </div>

  </div>
)}

        {/* Summary */}

        {summary && (
  <div className="mb-8 rounded-[28px] border border-[#D4AF37]/20 bg-[#EEF7F2] p-8 shadow-md">

    <div className="mb-6 flex items-center justify-between">

      <h3 className="text-2xl font-bold text-[#14532D]">
        📄 Document Summary
      </h3>

      <button
        onClick={() => copyText(summary)}
        className="rounded-xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
      >
        Copy
      </button>

    </div>

    <div className="prose prose-lg max-w-none text-[#06281F]">
      <ReactMarkdown>
        {summary}
      </ReactMarkdown>
    </div>

  </div>
)}

        {/* Answer */}

        {answer && (
  <div className="mb-8 rounded-[28px] border border-[#D4AF37]/20 bg-[#EEF7F2] p-8 shadow-md">

    <div className="mb-6 flex items-center justify-between">

      <h3 className="text-2xl font-bold text-[#14532D]">
        🤖 AI Answer
      </h3>

      <button
        onClick={() => copyText(answer)}
        className="rounded-xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
      >
        Copy
      </button>

    </div>

    <div className="whitespace-pre-wrap rounded-2xl bg-white p-6 text-[16px] leading-8 text-[#06281F]">
      {answer}
    </div>

  </div>
)}

        {/* Quiz */}

        {quiz && (
  <div className="mb-8 rounded-[28px] border border-[#D4AF37]/20 bg-[#EEF7F2] p-8 shadow-md">

    <div className="mb-6 flex items-center justify-between">

      <h3 className="text-2xl font-bold text-[#14532D]">
        📝 Quiz
      </h3>

      <button
        onClick={() => copyText(quiz)}
        className="rounded-xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
      >
        Copy
      </button>

    </div>

    <div className="rounded-2xl bg-white p-6">

      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-4 text-[#06281F]">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="mb-5 text-2xl font-bold text-[#06281F]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 text-xl font-bold text-[#14532D]">
              {children}
            </h2>
          ),
          li: ({ children }) => (
            <li className="text-[#06281F]">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="text-[#14532D]">{children}</strong>
          ),
        }}
      >
        {quiz}
      </ReactMarkdown>

    </div>

  </div>
)}
        {interview && (
  <div className="rounded-[28px] border border-[#D4AF37]/20 bg-[#EEF7F2] p-8 shadow-md">

    <div className="mb-6 flex items-center justify-between">

      <h3 className="text-2xl font-bold text-[#14532D]">
        🎤 Interview Questions
      </h3>

      <button
        onClick={() => copyText(interview)}
        className="rounded-xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-4 py-2 text-sm font-semibold text-white shadow transition hover:shadow-lg"
      >
        Copy
      </button>

    </div>

    <div className="prose prose-lg max-w-none rounded-2xl bg-white p-6 text-[#06281F]">
      <ReactMarkdown>
        {interview}
      </ReactMarkdown>
    </div>

  </div>
)}
      </div>
    </>
  );
}