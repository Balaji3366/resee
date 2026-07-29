"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";


export default function ResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  type ResumeAnalysis = {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
};

  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [resumeText, setResumeText] = useState("");
  
  const [downloading, setDownloading] = useState(false);
  const score = result?.atsScore ?? 0;

  const strengths = result?.strengths ?? [];

  const weaknesses = result?.weaknesses ?? [];

const suggestions = result?.suggestions ?? [];

const missingKeywords = result?.missingKeywords ?? [];

const summary = result?.summary ?? "";

const scoreColor =
  score >= 75
    ? "bg-green-600"
    : score >= 50
    ? "bg-yellow-500"
    : "bg-red-600";
    const downloadReport = async () => {
  setDownloading(true);

  try {
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("AI Resume Analysis Report", 20, y);

    y += 15;

    doc.setFontSize(16);
    doc.text(`ATS Score: ${score}/100`, 20, y);

    y += 15;

    doc.setFontSize(15);
    doc.text("Strengths", 20, y);

    y += 10;

    strengths.forEach((item: string) => {
  doc.setFontSize(12);

  const lines = doc.splitTextToSize(`• ${item}`, 160);

  doc.text(lines, 25, y);

  y += lines.length * 8;
  if (y > 270) {
  doc.addPage();
  y = 20;
}
});

    y += 5;

    doc.setFontSize(15);
    doc.text("Weaknesses", 20, y);

    y += 10;

    weaknesses.forEach((item: string) => {
  doc.setFontSize(12);

  const lines = doc.splitTextToSize(`• ${item}`, 160);

  doc.text(lines, 25, y);

  y += lines.length * 8;
  if (y > 270) {
  doc.addPage();
  y = 20;
}
});

    y += 5;

    doc.setFontSize(15);
doc.text("Suggestions", 20, y);

y += 10;

suggestions.forEach((item: string) => {
  doc.setFontSize(12);

  const lines = doc.splitTextToSize(`• ${item}`, 160);

  doc.text(lines, 25, y);

  y += lines.length * 8;
  if (y > 270) {
  doc.addPage();
  y = 20;
}
});

    doc.save("RESEE_AI_Resume_Report.pdf");
  } catch (error) {
    console.error(error);
  } finally {
    setDownloading(false);
  }
};
const improveResume = async () => {
  try {
    setLoading(true);

    const response = await fetch("/api/resume/improve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText,
        analysis: result,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to improve resume");
    }

    sessionStorage.setItem(
  "improvedResume",
  JSON.stringify(data.data)
);

router.push("/resume/improved");

router.push("/resume/improved");
  } catch (error) {
    console.error(error);
    alert("Failed to improve resume.");
  } finally {
    setLoading(false);
  }
};
  const analyzeResume = async () => {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }


    setLoading(true);

    try {
      const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
        });

      const data = await response.json();

if (!response.ok || !data.data) {
  setResult(
    data.message || "Gemini API quota exceeded. Please try again later."
  );
  setLoading(false);
  return;
}

const atsScore = data.data.atsScore;
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Logged in user:", user);

if (!user) {
  alert("Please login first.");
  setLoading(false);
  return;
}

    const { error } = await supabase
  .from("resume_history")
  .insert([
    {
      user_id:user.id,
      file_name: file.name,
      ats_score: atsScore,
      report: JSON.stringify(data.data),
    },
  ]);

if (error) {
  console.error("Supabase Error:", error);
}
  console.log("API DATA:", data.data);  
  setResumeText(data.resumeText);
setResult(data.data);
      
    } catch (error) {
  console.error(error);
  setResult(null);
} finally {
  setLoading(false);
}
};
console.log("RESULT STATE:", result);
  return (
  <section className="min-h-screen bg-gradient-to-br from-ink via-white to-panel py-14">
    <div className="mx-auto max-w-6xl px-6">

  <div className="mb-8">
    <BackButton variant="light" />
  </div>

  {/* Hero */}

  <div className="text-center">

    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber to-amber-dim shadow-xl ring-4 ring-amber/20">

      <FileText className="h-12 w-12 text-white" />

    </div>

    <h1 className="font-display text-5xl font-extrabold text-bone">
      AI Resume Analyzer
    </h1>

    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate">
      Upload your resume and receive a professional ATS score,
      AI-powered insights, strengths, weaknesses, missing keywords
      and improvement suggestions.
    </p>

  </div>

  {/* Upload Card */}

  <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[32px] border border-amber/20 bg-panel shadow-[0_30px_80px_rgba(10,59,46,0.12)]">

    {/* Header */}

    <div className="relative overflow-hidden bg-gradient-to-r from-amber via-amber-dim to-amber px-10 py-8">

      <h2 className="font-display text-3xl font-bold text-white">
        Upload Resume
      </h2>

      <p className="mt-2 text-bone/80">
        Supported format: PDF
      </p>

    </div>

    <div className="p-10">

      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber bg-gradient-to-br from-white to-ink py-10 px-8 transition-all duration-300 hover:scale-[1.01] hover:border-amber hover:shadow-2xl">

        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-dim to-amber text-5xl shadow-xl transition duration-300 group-hover:scale-110">
          📄
        </div>

        <h3 className="text-3xl font-bold text-bone">
          Upload Your Resume
        </h3>

        <p className="mt-3 text-center text-slate leading-7">
          Drop your PDF here or click to browse.
        </p>

        <p className="mt-2 text-sm font-medium text-amber-dim">
          PDF only • Max 5 MB
        </p>

        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

      </label>

      {file && (

        <div className="mt-8 rounded-2xl border border-teal/30 bg-panel-2 p-5">

          <p className="font-semibold text-amber">
            ✅ {file.name}
          </p>

        </div>

      )}

      <button
          onClick={analyzeResume}
          disabled={loading || !file}
          className="mt-8 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber via-amber-dim to-amber py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-panel-2 disabled:text-slate disabled:shadow-none disabled:hover:translate-y-0"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Analyzing Resume...</span>
            </div>
          ) : (
            "Analyze Resume"
          )}
        </button>
        {!file && (
        <p className="mt-3 text-center text-sm text-slate">
          Please upload a PDF to enable analysis.
        </p>
      )}
    </div>

  </div>

    {result && (
  <div className="mt-8 rounded-2xl bg-panel p-8 shadow-xl border">

    <h2 className="font-display mb-6 text-3xl font-bold text-center text-bone">
        📊 AI Resume Analysis
        </h2>

    {/* ATS Score */}
<div className="mb-8 rounded-xl bg-panel-2 p-6">
  <h3 className="text-xl font-bold text-blue-400">
    📊 ATS Score
  </h3>

  <p className="mt-2 text-slate">
    {score >= 75
      ? "Excellent ATS Score ⭐⭐⭐⭐"
      : score >= 50
      ? "Good ATS Score 👍"
      : "Needs Improvement ⚠️"}
  </p>

  <p
    className={`mt-2 text-4xl font-extrabold ${
      score >= 75
        ? "text-green-400"
        : score >= 50
        ? "text-yellow-400"
        : "text-red-400"
    }`}
  >
    {score}/100
  </p>

  <div className="mt-4 h-4 w-full rounded-full bg-panel-2">
    <div
      className={`h-4 rounded-full ${scoreColor} transition-all duration-700`}
      style={{ width: `${score}%` }}
    />
  </div>
</div>
{/* AI Summary */}
<div className="mb-6 rounded-xl bg-panel-2 p-6">
  <h3 className="mb-4 text-xl font-bold text-indigo-400">
    📝 AI Summary
  </h3>

  <p className="leading-7 text-bone">
    {summary}
  </p>
</div>
{/* Strengths */}
<div className="mb-6 rounded-xl bg-panel-2 p-6">
  <h3 className="mb-4 text-xl font-bold text-green-400">
    💪 Strengths
  </h3>

  <ul className="space-y-2">
    {strengths.map((item, index) => (
      <li key={index} className="text-bone">
        ✅ {item}
      </li>
    ))}
  </ul>
</div>

{/* Weaknesses */}
<div className="mb-6 rounded-xl bg-panel-2 p-6">
  <h3 className="mb-4 text-xl font-bold text-yellow-400">
    ⚠ Weaknesses
  </h3>

  <ul className="space-y-2">
    {weaknesses.map((item, index) => (
      <li key={index} className="text-bone">
        ❌ {item}
      </li>
    ))}
  </ul>
</div>
{/* Missing Keywords */}
<div className="mb-6 rounded-xl bg-panel-2 p-6">
  <h3 className="mb-4 text-xl font-bold text-orange-400">
    🏷 Missing Keywords
  </h3>

  <ul className="space-y-2">
    {missingKeywords.map((item, index) => (
      <li key={index} className="text-bone">
        🔑 {item}
      </li>
    ))}
  </ul>
</div>
{/* Suggestions */}
<div className="mb-6 rounded-xl bg-panel-2 p-6">
  <h3 className="mb-4 text-xl font-bold text-purple-400">
    🚀 Suggestions
  </h3>

  <ul className="space-y-2">
    {suggestions.map((item, index) => (
      <li key={index} className="text-bone">
        💡 {item}
      </li>
    ))}
  </ul>
</div>
<button
  onClick={improveResume}
  disabled={loading}
  className="mt-8 w-full rounded-xl bg-teal py-4 text-lg font-semibold text-white transition hover:bg-teal-dim disabled:opacity-50"
>
  {loading ? "Improving Resume..." : "✨ Improve My Resume"}
</button>
<button
  onClick={downloadReport}
  disabled={downloading}
  className="mt-8 w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
>
  {downloading ? (
    <div className="flex items-center justify-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      <span>Generating PDF...</span>
    </div>
  ) : (
    "📄 Download ATS Report"
  )}
</button>
  </div>
)}
        </div>
      
    </section>
  );
}