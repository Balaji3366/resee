"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardHero from "@/components/DashboardHero";
import DashboardStats from "@/components/DashboardStats";
import DashboardFeatures from "@/components/DashboardFeatures";

export default function Dashboard() {
  const [resumeCount, setResumeCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { count } = await supabase
      .from("resume_history")
      .select("*", {
        count: "exact",
        head: true,
      });

    setResumeCount(count || 0);

    const { data: documentFiles, error } =
      await supabase.storage.from("uploads").list();

    if (error) {
      console.error(error);
    } else {
      setDocumentCount(documentFiles?.length || 0);
    }
  }

  return (
    <section
      id="dashboard"
      className="min-h-screen bg-[#F8FAF8] pt-2 pb-16"
    >
      <div className="mx-auto max-w-7xl px-6">

        <DashboardNavbar />

        <DashboardHero
          resumeCount={resumeCount}
          documentCount={documentCount}
        />

        <DashboardStats
          resumeCount={resumeCount}
          documentCount={documentCount}
        />

        <DashboardFeatures />

        <footer className="mt-20 border-t border-[#D4AF37]/20 pt-10 text-center">
          <h3 className="text-2xl font-bold text-[#06281F]">
            ✨ Mentora
          </h3>

          <p className="mt-3 max-w-2xl mx-auto text-gray-600 leading-7">
            Your AI Career Mentor. Helping students and professionals
            analyse resumes, prepare for interviews and build successful
            careers using Artificial Intelligence.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Resume AI
            </span>

            <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
              Career Growth
            </span>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Documents
            </span>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            © 2026 Mentora. All Rights Reserved.
          </p>
        </footer>

      </div>
    </section>
  );
}
