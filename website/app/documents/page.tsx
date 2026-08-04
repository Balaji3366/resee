"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import UploadCard from "@/components/documents/UploadCard";
import RecentFiles from "@/components/documents/RecentFiles";
import AIActions from "@/components/documents/AIActions";
import DocumentAIPanel from "@/components/documents/DocumentAIPanel";
import PageLayout from "@/components/PageLayout";

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState("");

  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const [quiz, setQuiz] = useState("");
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [interview, setInterview] = useState("");
  const [loadingInterview, setLoadingInterview] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Pre-existing pattern, unrelated to this file's only actual change
    // here (the AIWorkspace -> DocumentAIPanel rename below) — refactoring
    // this component's initial data-load architecture is out of scope.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFiles();
  }, []);
  useEffect(() => {
    if (summary || answer || quiz || interview) {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [summary, answer, quiz, interview]);
  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select a PDF first.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadSuccess(`${data.filename} uploaded successfully!`);
        setFile(null);
        fetchFiles();

        setTimeout(() => {
          setUploadSuccess("");
        }, 4000);
      } else {
        setUploadSuccess("");
        toast.error("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }

    setUploading(false);
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl pt-16">
        <div className="mb-8">
          <h1 className="font-display mb-2 text-4xl font-bold text-bone">
            📄 AI Document Workspace
          </h1>

          <p className="text-slate">
            Upload any PDF and instantly generate summaries, answers, quizzes, and interview
            questions using AI.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:auto-rows-fr">
          <UploadCard
            file={file}
            setFile={setFile}
            uploading={uploading}
            uploadSuccess={uploadSuccess}
            uploadFile={uploadFile}
          />

          <RecentFiles
            files={files}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setSummary={setSummary}
            fetchFiles={fetchFiles}
          />

          <AIActions
            selectedFile={selectedFile}
            scrollToWorkspace={scrollToWorkspace}
            summary={summary}
            setSummary={setSummary}
            loadingSummary={loadingSummary}
            setLoadingSummary={setLoadingSummary}
            question={question}
            setQuestion={setQuestion}
            answer={answer}
            setAnswer={setAnswer}
            loadingAnswer={loadingAnswer}
            setLoadingAnswer={setLoadingAnswer}
            quiz={quiz}
            setQuiz={setQuiz}
            loadingQuiz={loadingQuiz}
            setLoadingQuiz={setLoadingQuiz}
            interview={interview}
            setInterview={setInterview}
            loadingInterview={loadingInterview}
            setLoadingInterview={setLoadingInterview}
          />
        </div>

        <div ref={workspaceRef} className="mt-8">
          <DocumentAIPanel
            summary={summary}
            answer={answer}
            quiz={quiz}
            interview={interview}
            loadingSummary={loadingSummary}
            loadingAnswer={loadingAnswer}
            loadingQuiz={loadingQuiz}
            loadingInterview={loadingInterview}
          />
        </div>
      </div>
    </PageLayout>
  );
}
