"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import MockTestCard from "@/components/practice/MockTestCard";
import { useMockTests } from "@/hooks/useMockTests";

export default function MockTestsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: mockTests, loading } = useMockTests();

  return (
    <section className="min-h-screen bg-ink pt-2 pb-16">
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="flex gap-6 lg:gap-8">
          <DashboardSidebar
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-7xl">
              <DashboardNavbar onMenuClick={() => setMobileNavOpen(true)} />

              <div className="mb-8">
                <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
                  Mock Tests
                </h1>

                <p className="mt-2 text-slate">
                  Timed, full-length tests that simulate real exam conditions.
                </p>
              </div>

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-3xl border border-amber/20 bg-panel"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {(mockTests ?? []).map((test) => (
                    <MockTestCard key={test.id} test={test} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
