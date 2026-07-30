"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminNavbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 mb-8 rounded-3xl border border-amber/20 bg-panel/90 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between px-8 py-5">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl border border-bone/15 text-bone lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber to-amber-dim text-white shadow-lg">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-display text-2xl font-extrabold text-amber">RESEE Admin</h2>
            <p className="text-xs font-medium text-slate">Content & Platform Management</p>
          </div>
        </div>

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
