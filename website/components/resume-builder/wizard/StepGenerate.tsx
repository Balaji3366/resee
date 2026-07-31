"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { ResumeContent } from "@/types/resume-builder";

const MESSAGES = [
  "Creating professional resume...",
  "Optimising layout...",
  "Formatting sections...",
  "Almost ready...",
];

const MIN_DISPLAY_MS = 2500;
const MESSAGE_INTERVAL_MS = 1200;

export default function StepGenerate({
  mode,
  resumeId,
  answers,
}: {
  mode: "create" | "edit";
  resumeId?: string;
  answers: ResumeContent;
}) {
  const router = useRouter();

  const [messageIndex, setMessageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorMessage(null);

    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);

    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS));

    const apiCall =
      mode === "edit"
        ? fetch(`/api/resumes/${resumeId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: answers }),
          }).then((res) => res.json())
        : fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: answers }),
          }).then((res) => res.json());

    Promise.all([apiCall, minDelay])
      .then(([json]) => {
        if (cancelled) return;
        clearInterval(messageTimer);

        if (json.success) {
          router.replace(`/resumes/${mode === "edit" ? resumeId : json.resumeId}`);
        } else {
          setErrorMessage(json.message || "Something went wrong.");
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearInterval(messageTimer);
        setErrorMessage("Something went wrong while generating your resume.");
      });

    return () => {
      cancelled = true;
      clearInterval(messageTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (errorMessage) {
    return (
      <div className="py-6 text-center">
        <h2 className="font-display text-2xl font-bold text-bone">We couldn&apos;t generate your resume</h2>
        <p className="mt-3 text-slate">{errorMessage}</p>

        <button
          type="button"
          onClick={() => setAttempt((a) => a + 1)}
          className="mt-8 w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-amber/30 border-t-amber-dim" />

      <h2 className="font-display text-2xl font-bold text-bone">
        {mode === "edit" ? "Updating Your Resume..." : "Generating Your Resume..."}
      </h2>

      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-3 text-slate"
        >
          {MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
