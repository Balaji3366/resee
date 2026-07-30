"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <section className="min-h-screen bg-ink pt-2 pb-16">
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="flex gap-6 lg:gap-8">
          <DashboardSidebar
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <DashboardNavbar onMenuClick={() => setMobileNavOpen(true)} />
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
