"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import LogoutModal from "@/components/auth/LogoutModal";
import { toastSuccess, toastError } from "@/lib/toast";

/**
 * Previously duplicated Dashboard/Resume/Documents as buttons here on
 * top of the sidebar already having Dashboard and Resume (Documents
 * wasn't even in the sidebar) — removed; the sidebar is the single nav
 * source now. What's left is genuinely top-bar-only: mobile menu
 * trigger, brand, and account controls. The avatar+dropdown here
 * mirrors the same pattern already used for logged-in users in the
 * public components/Navbar.tsx, not a new interaction pattern.
 */
export default function DashboardNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user } = useUser();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error(error);
        toastError("Couldn't log you out. Please try again.");
        return;
      }

      setLogoutOpen(false);
      toastSuccess("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      toastError("Couldn't log you out. Please try again.");
    }
  }

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-50 mb-7 rounded-full border border-bone/10 bg-ink/90 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/15 text-bone lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

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

        <div className="flex-1" />

        {/* Account menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-full border border-bone/15 py-1.5 pl-1.5 pr-3 text-bone transition hover:border-amber/40"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber font-bold text-ink">
              {fullName.charAt(0).toUpperCase()}
            </span>

            <span className="hidden text-sm font-semibold sm:inline">{fullName}</span>

            <ChevronDown size={16} className="text-slate" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-bone/10 bg-panel shadow-xl">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center gap-2.5 px-5 py-3 text-left text-sm font-semibold text-bone transition hover:bg-bone/5"
              >
                <SettingsIcon size={16} />
                Settings
              </button>

              <hr className="border-bone/10" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-5 py-3 text-left text-sm font-semibold text-bone transition hover:bg-bone/5"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <LogoutModal
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}
