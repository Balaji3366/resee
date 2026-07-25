"use client";

import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import ResumePreview from "@/components/ResumePreview";
import Toast from "@/components/Toast";
import { downloadPDF, downloadDOCX } from "./download";

type Experience = {
  company: string;
  role: string;
  location: string;
  duration: string;
  points: string[];
};

type Education = {
  degree: string;
  college: string;
  year: string;
};

type ResumeData = {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
};

export default function ImprovedResumePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  useEffect(() => {
    const saved = sessionStorage.getItem("improvedResume");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setResume(parsed);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const showToast = (message: string) => {
    setToast({
      show: true,
      message,
    });
  };

  const copyResume = async () => {
    if (!resume) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(resume, null, 2)
      );

      showToast("✅ Resume copied successfully");
    } catch {
      showToast("❌ Failed to copy");
    }
  };

  const handleDownloadPDF = () => {
    if (!resume) return;

    downloadPDF(JSON.stringify(resume, null, 2));
  };

  const handleDownloadDOCX = async () => {
    if (!resume) return;

    await downloadDOCX(JSON.stringify(resume, null, 2));
  };

  return (
    <>
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() =>
          setToast({
            show: false,
            message: "",
          })
        }
      />

      <main className="min-h-screen bg-slate-100 py-10">

        <div className="mx-auto max-w-6xl">

          <div className="mb-6">
            <BackButton variant="light" />
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-xl">

            <div className="mb-10 text-center">

              <h1 className="text-4xl font-bold text-emerald-600">
                ✨ Resume Improved Successfully
              </h1>

              <p className="mt-3 text-gray-600">
                Your resume has been optimized for ATS and recruiter readability.
              </p>

            </div>
            {resume ? (
              <>
                <ResumePreview data={resume} />

                <div className="mt-8 flex flex-wrap justify-center gap-4">

                  <button
                    onClick={handleDownloadPDF}
                    className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
                  >
                    📄 Download PDF
                  </button>

                  <button
                    onClick={handleDownloadDOCX}
                    className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    📝 Download DOCX
                  </button>

                  <button
                    onClick={copyResume}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-100"
                  >
                    📋 Copy Resume
                  </button>

                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
                <h2 className="text-2xl font-semibold text-gray-700">
                  No Improved Resume Found
                </h2>

                <p className="mt-3 text-gray-500">
                  Please go back and generate an improved resume first.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>
    </>
  );
}