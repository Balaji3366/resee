"use client";

import { toast } from "sonner";

interface AIActionsProps {
  selectedFile: string;
  scrollToWorkspace: () => void;
  summary: string;
  setSummary: (value: string) => void;
  loadingSummary: boolean;
  setLoadingSummary: (value: boolean) => void;

  question: string;
  setQuestion: (value: string) => void;
  answer: string;
  setAnswer: (value: string) => void;
  loadingAnswer: boolean;
  setLoadingAnswer: (value: boolean) => void;

  quiz: string;
  setQuiz: (value: string) => void;
  loadingQuiz: boolean;
  setLoadingQuiz: (value: boolean) => void;

  interview: string;
  setInterview: (value: string) => void;
  loadingInterview: boolean;
  setLoadingInterview: (value: boolean) => void;
}

export default function AIActions({
  selectedFile,
  scrollToWorkspace,
  setSummary,
  loadingSummary,
  setLoadingSummary,

  question,
  setQuestion,
  setAnswer,
  loadingAnswer,
  setLoadingAnswer,

  setQuiz,
  loadingQuiz,
  setLoadingQuiz,

  setInterview,
  loadingInterview,
  setLoadingInterview,
}: AIActionsProps) {
  const checkFile = () => {
    if (!selectedFile || selectedFile.trim() === "") {
      toast.error("Please select a document first.");
      return false;
    }
    return true;
  };

  const summarizeDocument = async () => {
    if (!checkFile()) return;

    setSummary("");
    setAnswer("");
    setQuiz("");
    setInterview("");
    setLoadingSummary(true);
    scrollToWorkspace();

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile,
        }),
      });

      const data = await res.json();
      setSummary(data.summary || "No summary generated.");
    } catch {
      toast.error("Failed to summarize document.");
    }

    setLoadingSummary(false);
  };

  const askQuestion = async () => {
    if (!checkFile()) return;

    if (!question.trim()) {
      toast.error("Enter a question.");
      return;
    }

    setSummary("");
    setAnswer("");
    setQuiz("");
    setInterview("");
    setLoadingAnswer(true);
    scrollToWorkspace();

    try {
      const res = await fetch("/api/pdf-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile,
          question,
        }),
      });

      const data = await res.json();
      setAnswer(data.answer || "No answer found.");
    } catch {
      toast.error("Failed to get AI answer.");
    }

    setLoadingAnswer(false);
  };

  const generateQuiz = async () => {
    if (!checkFile()) return;

    setSummary("");
    setAnswer("");
    setQuiz("");
    setInterview("");
    setLoadingQuiz(true);
    scrollToWorkspace();

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile,
        }),
      });

      const data = await res.json();
      setQuiz(data.quiz || "Quiz not generated.");
    } catch {
      toast.error("Quiz generation failed.");
    }

    setLoadingQuiz(false);
  };

  const generateInterview = async () => {
    if (!checkFile()) return;

    setSummary("");
    setAnswer("");
    setQuiz("");
    setInterview("");
    setLoadingInterview(true);
    scrollToWorkspace();

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile,
        }),
      });

      const data = await res.json();
      setInterview(data.interview || "Interview questions not generated.");
    } catch {
      toast.error("Failed to generate interview questions.");
    }

    setLoadingInterview(false);
  };

  return (
    <div className="h-[430px] flex flex-col rounded-[30px] border border-[#D4AF37]/20 bg-white p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)]">

      <h2 className="mb-2 text-2xl font-bold text-[#06281F]">
        AI Actions
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Select an action to analyze your document.
      </p>

      <button
        onClick={summarizeDocument}
        disabled={loadingSummary}
        className="mb-3 w-full rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingSummary ? "Analyzing..." : "Summarize Document"}
      </button>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask Mentora anything about this PDF..."
        rows={2}
        className="mb-4 w-full rounded-2xl border border-[#D4AF37]/20 bg-white p-4 text-[#06281F] placeholder:text-gray-400 outline-none transition focus:border-[#14532D] focus:ring-4 focus:ring-[#14532D]/10"
      />

      <button
        onClick={askQuestion}
        disabled={loadingAnswer}
        className="mb-3 w-full rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingAnswer ? "Thinking..." : "Ask AI"}
      </button>

      <button
        onClick={generateQuiz}
        disabled={loadingQuiz}
        className="mb-3 w-full rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingQuiz ? "Generating..." : "Generate Quiz"}
      </button>

      <button
        onClick={generateInterview}
        disabled={loadingInterview}
        className="w-full rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingInterview
          ? "Generating..."
          : "Interview Questions"}
      </button>
    </div>
  );
}