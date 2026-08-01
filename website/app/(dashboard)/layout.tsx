"use client";

import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import AppShell from "@/components/layout/AppShell";

export default function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      renderSidebar={(props) => <DashboardSidebar {...props} />}
      renderNavbar={(props) => <DashboardNavbar {...props} />}
    >
      {children}
    </AppShell>
  );
}
