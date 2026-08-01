"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  TrendingUp,
  FileText,
  Files,
  Mic,
  Briefcase,
  User,
  Settings as SettingsIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Learning", icon: BookOpen, href: "/learning" },
  { label: "Practice", icon: Target, href: "/practice" },
  { label: "Progress", icon: TrendingUp, href: "/progress" },
  { label: "My Resumes", icon: Files, href: "/resumes" },
  { label: "Resume", icon: FileText, href: "/resume" },
  { label: "Mock Interviews", icon: Mic, href: "/interviews" },
  { label: "Jobs", icon: Briefcase, href: "/jobs" },
  { label: "Profile", icon: User },
  { label: "Settings", icon: SettingsIcon, href: "/settings" },
];

function SidebarBrand() {
  return (
    <div className="mb-3 flex items-center gap-3 border-b-2 border-bone/10 px-3 pb-5 pt-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-dim font-display text-lg font-extrabold text-ink">
        R
      </span>

      <span className="font-display text-lg font-extrabold text-bone">RESEE</span>
    </div>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        if (!item.href) {
          return (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-full bg-panel-2 px-4 py-2.5 text-slate"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <Icon size={18} />
                {item.label}
              </span>

              <span className="rounded-full bg-panel px-2 py-0.5 text-[10px] font-bold text-slate">
                Soon
              </span>
            </div>
          );
        }

        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition ${
              isActive
                ? "bg-amber-dim font-bold text-ink"
                : "font-semibold text-bone hover:bg-amber/10"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="sticky top-6 hidden h-fit w-64 shrink-0 rounded-3xl border-2 border-bone bg-panel p-4 lg:block">
        <SidebarBrand />
        <NavList pathname={pathname} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-bone/40 lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r-2 border-bone bg-panel p-6 lg:hidden"
            >
              <SidebarBrand />
              <NavList pathname={pathname} onNavigate={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
