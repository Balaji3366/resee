"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import BackButton from "@/components/BackButton";

type Resume = {
  id: string;
  file_name: string;
  ats_score: number;
  report: string;
  created_at: string;
};

export default function ResumeHistoryPage() {
  const [reports, setReports] = useState<Resume[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const { data, error } = await supabase
      .from("resume_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setReports(data ?? []);
  }

  async function deleteReport() {
    if (!selectedId) return;

    const { error } = await supabase
      .from("resume_history")
      .delete()
      .eq("id", selectedId);

    if (error) {
      console.error(error);
      alert("Failed to delete report.");
      return;
    }

    setShowDeleteModal(false);
    setSelectedId(null);

    fetchReports();
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#F8FAF8] via-white to-[#EEF7F2] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="mb-14 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0A3B2E] to-[#14532D] shadow-xl ring-4 ring-[#D4AF37]/20">

          <span className="text-4xl">📂</span>

        </div>

        <h1 className="text-5xl font-extrabold text-[#06281F]">
          Resume Reports
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          View all your AI resume analysis reports in one place.
        </p>

      </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reports.length === 0 ? (
            <div className="col-span-full rounded-[32px] border border-[#D4AF37]/20 bg-white p-14 text-center shadow-[0_20px_70px_rgba(10,59,46,.08)]">
              <h2 className="text-2xl font-bold text-gray-800">
                No Resume Reports Yet
              </h2>

              <p className="mt-3 text-gray-500">
                Analyze your first resume to start building your report history.
              </p>

              <Link
                href="/resume"
                className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Analyze Resume
              </Link>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex min-h-[360px] flex-col justify-between rounded-[30px] border border-[#D4AF37]/20 bg-white p-7 shadow-[0_20px_70px_rgba(10,59,46,.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_90px_rgba(10,59,46,.15)]"
              >
                <h2 className="mb-3 h-14 break-words text-center text-base font-bold leading-5 text-[#06281F] overflow-hidden">
                  {report.file_name}
                </h2>

                <p className="mt-4 text-center text-gray-500">
                  ATS Match Score
                </p>

                <p
                  className={`mt-2 text-center text-5xl font-extrabold ${
                    report.ats_score >= 75
                      ? "text-green-700"
                      : report.ats_score >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {report.ats_score}/100
                </p>
                  <p className="mt-2 text-center text-sm font-semibold text-[#14532D]">
                {report.ats_score >= 75
                  ? "Excellent ATS Match"
                  : report.ats_score >= 50
                  ? "Good ATS Match"
                  : "Needs Improvement"}
              </p>
                <p className="mt-3 text-center text-sm text-gray-500">
                  📅 {new Date(report.created_at).toLocaleDateString()}
                </p>

                <Link
                  href={`/resume-history/${report.id}`}
                  className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] py-3.5 text-center font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  View Report
                </Link>

                <button
                  onClick={() => {
                    setSelectedId(report.id);
                    setShowDeleteModal(true);
                  }}
                  className="mt-3 w-full rounded-2xl border border-red-400 bg-white py-3.5 font-bold text-red-600 transition-all duration-300 hover:bg-red-50"
                >
                  Delete Report
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-[#D4AF37]/20">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF7F2]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0A3B2E] to-[#14532D] shadow-lg transition-transform duration-300 hover:rotate-12 hover:scale-110">
                <Trash2 className="h-8 w-8 -rotate-12 text-white" />
              </div>
            </div>

              <h2 className="mt-4 text-2xl font-bold text-[#06281F]">
                Delete Rsume Report?
              </h2>

              <p className="mt-3 text-gray-600">
                Are you sure you want to permanently delete this resume report?
                <br />
                This action cannot be undone.
              </p>
            </div>

            <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedId(null);
              }}
              className="rounded-xl border border-[#D4AF37] bg-white px-8 py-3 font-semibold text-[#0A3B2E] shadow-sm transition-all duration-300 hover:bg-[#F8FAF8] hover:shadow-md active:scale-95"
            >
              Cancel
            </button>

            <button
              onClick={deleteReport}
              className="rounded-xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Delete
            </button>
          </div>
          </div>
        </div>
      )}
    </section>
  );
}