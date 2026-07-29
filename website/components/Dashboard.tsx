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
      className="min-h-screen bg-ink pt-2 pb-16"
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

        <footer className="mt-20 border-t border-amber/20 pt-10 text-center">
          <h3 className="text-2xl font-bold text-bone">
            ✨ RESEE
          </h3>

          <p className="mt-3 max-w-2xl mx-auto text-slate leading-7">
            Your AI Career Mentor. Helping students and professionals
            analyse resumes, prepare for interviews and build successful
            careers using Artificial Intelligence.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <span className="rounded-full bg-teal-dim/20 px-4 py-2 text-sm font-semibold text-teal">
              Resume AI
            </span>

            <span className="rounded-full bg-amber-dim/20 px-4 py-2 text-sm font-semibold text-amber">
              Career Growth
            </span>

            <span className="rounded-full bg-panel-2 px-4 py-2 text-sm font-semibold text-slate">
              Documents
            </span>
          </div>

          <p className="mt-8 text-sm text-slate">
            © 2026 RESEE. All Rights Reserved.
          </p>
        </footer>

      </div>
    </section>
  );
}
