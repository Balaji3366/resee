"use client";

import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AppShell from "@/components/layout/AppShell";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      renderSidebar={(props) => <AdminSidebar {...props} />}
      renderNavbar={(props) => <AdminNavbar {...props} />}
    >
      {children}
    </AppShell>
  );
}
