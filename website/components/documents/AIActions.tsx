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
    <div className="min-h-[430px] rounded-[30px] border border-amber/20 bg-panel p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)]">

      <h2 className="font-display mb-2 text-2xl font-bold text-bone">
        AI Actions
      </h2>

      <p className="mb-6 text-sm text-slate">
        Select an action to analyze your document.
      </p>

      <button
        onClick={summarizeDocument}
        disabled={loadingSummary}
        className="mb-3 w-full rounded-2xl bg-gradient-to-r from-amber to-amber-dim px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingSummary ? "Analyzing..." : "Summarize Document"}
      </button>

     <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask RESEE anything about this PDF..."
        rows={3}
        className="mb-4 block w-full resize-none rounded-2xl border border-amber/20 bg-panel px-4 py-3 text-bone placeholder:text-slate outline-none transition-all duration-300 focus:border-amber-dim focus:ring-2 focus:ring-amber-dim/10"
      />

      <button
        onClick={askQuestion}
        disabled={loadingAnswer}
        className="mb-3 w-full rounded-2xl bg-gradient-to-r from-amber to-amber-dim px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingAnswer ? "Thinking..." : "Ask AI"}
      </button>

      <button
        onClick={generateQuiz}
        disabled={loadingQuiz}
        className="mb-3 w-full rounded-2xl bg-gradient-to-r from-amber to-amber-dim px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingQuiz ? "Generating..." : "Generate Quiz"}
      </button>

      <button
        onClick={generateInterview}
        disabled={loadingInterview}
        className="w-full rounded-2xl bg-gradient-to-r from-amber to-amber-dim px-5 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50"
      >
        {loadingInterview
          ? "Generating..."
          : "Interview Questions"}
      </button>
    </div>
  );
}