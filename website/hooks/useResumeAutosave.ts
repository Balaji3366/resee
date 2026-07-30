import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeContent } from "@/types/resume-builder";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 1500;

export function useResumeAutosave(resumeId: string) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef<ResumeContent | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const flush = useCallback(
    async (content: ResumeContent) => {
      try {
        setStatus("saving");

        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to save resume.");
        }

        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [resumeId]
  );

  const save = useCallback(
    (content: ResumeContent) => {
      latestContentRef.current = content;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (latestContentRef.current) flush(latestContentRef.current);
      }, DEBOUNCE_MS);
    },
    [flush]
  );

  const saveNow = useCallback(
    async (content: ResumeContent) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      await flush(content);
    },
    [flush]
  );

  return { status, save, saveNow };
}
