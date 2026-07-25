"use client";

import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FileText, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardNavbar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 mb-8 rounded-3xl border border-[#D4AF37]/20 bg-white/90 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between px-8 py-5">
        {/* Logo */}

        <div
          className="flex cursor-pointer items-center gap-4"
          onClick={() => router.push("/dashboard")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A3B2E] to-[#14532D] text-xl font-bold text-white shadow-lg">
            M
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#0A3B2E]">
              Mentora
            </h2>

            <p className="text-xs font-medium text-gray-500">
              AI Career Platform
            </p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl bg-[#0A3B2E] px-5 py-3 font-semibold text-white transition hover:scale-105"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/resume")}
            className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-gray-700 transition hover:bg-[#EEF7F2]"
          >
            <FileText size={18} />
            Resume
          </button>

          <button
            onClick={() => router.push("/documents")}
            className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-gray-700 transition hover:bg-[#EEF7F2]"
          >
            <FolderOpen size={18} />
            Documents
          </button>
        </nav>

        {/* Logout */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}