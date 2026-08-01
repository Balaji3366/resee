"use client";

import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FileText, FolderOpen, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 mb-7 rounded-full border-2 border-bone bg-ink/90 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {/* Mobile sidebar toggle */}

        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-bone/15 text-bone lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Logo */}

        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-dim font-display text-lg font-extrabold text-ink">
            R
          </div>

          <div className="hidden sm:block">
            <h2 className="font-display text-lg font-extrabold text-amber">RESEE</h2>
            <p className="text-xs font-semibold text-slate">AI Career Platform</p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="hidden items-center gap-2 lg:flex">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-full bg-amber-dim px-5 py-2.5 text-sm font-bold text-ink transition hover:scale-[1.03]"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/resume")}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-bone transition hover:bg-amber/10"
          >
            <FileText size={16} />
            Resume
          </button>

          <button
            onClick={() => router.push("/documents")}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-bone transition hover:bg-amber/10"
          >
            <FolderOpen size={16} />
            Documents
          </button>
        </nav>

        {/* Logout */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border-2 border-bone px-5 py-2.5 text-sm font-bold text-bone transition hover:bg-bone hover:text-ink"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
