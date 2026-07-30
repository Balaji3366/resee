"use client";

import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FileText, FolderOpen, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardNavbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 mb-8 rounded-3xl border border-amber/20 bg-panel/90 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between px-8 py-5">
        {/* Mobile sidebar toggle */}

        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl border border-bone/15 text-bone lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Logo */}

        <div
          className="flex cursor-pointer items-center gap-4"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber to-amber-dim text-xl font-bold text-white shadow-lg">
            M
          </div>

          <div>
            <h2 className="font-display text-2xl font-extrabold text-amber">
              RESEE
            </h2>

            <p className="text-xs font-medium text-slate">
              AI Career Platform
            </p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl bg-amber px-5 py-3 font-semibold text-white transition hover:scale-105"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/resume")}
            className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-bone transition hover:bg-panel"
          >
            <FileText size={18} />
            Resume
          </button>

          <button
            onClick={() => router.push("/documents")}
            className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-bone transition hover:bg-panel"
          >
            <FolderOpen size={18} />
            Documents
          </button>
        </nav>

        {/* Logout */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-panel-2 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}