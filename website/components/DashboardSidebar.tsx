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

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

// Grouped rather than one flat list of 10 — "Dashboard" stands alone as
// the home item, career tools cluster together, account items sit at
// the bottom. Same items/hrefs/order as before, just organized.
const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }] },
  {
    label: "Career Tools",
    items: [
      { label: "Learning", icon: BookOpen, href: "/learning" },
      { label: "Practice", icon: Target, href: "/practice" },
      { label: "Resume", icon: FileText, href: "/resume" },
      { label: "My Resumes", icon: Files, href: "/resumes" },
      { label: "Mock Interviews", icon: Mic, href: "/interviews" },
      { label: "Jobs", icon: Briefcase, href: "/jobs" },
      { label: "Progress", icon: TrendingUp, href: "/progress" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", icon: User },
      { label: "Settings", icon: SettingsIcon, href: "/settings" },
    ],
  },
];

function SidebarBrand() {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-bone/10 px-2 pb-6 pt-1">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-dim font-display text-lg font-extrabold text-ink">
        R
      </span>

      <span className="font-display text-xl font-extrabold text-bone">RESEE</span>
    </div>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group, groupIndex) => (
        <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-1">
          {group.label && (
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-bone/35">
              {group.label}
            </p>
          )}

          {group.items.map((item) => {
            const Icon = item.icon;

            if (!item.href) {
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-slate"
                >
                  <span className="flex items-center gap-3 text-[15px] font-semibold">
                    <Icon size={19} strokeWidth={2} />
                    {item.label}
                  </span>

                  <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[10px] font-bold text-slate">
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
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition ${
                  isActive
                    ? "bg-amber-dim/12 font-bold text-amber-dim"
                    : "font-semibold text-bone/80 hover:bg-bone/[0.04] hover:text-bone"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-amber-dim" />
                )}

                <Icon size={19} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
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
      {/* max-h + overflow-y-auto: with 10 nav items, "sticky + h-fit" alone
          could grow taller than the viewport on shorter screens, and a
          sticky element has no scroll of its own — anything past the
          viewport edge (Profile/Settings, at the bottom) would be
          permanently unreachable. This keeps it internally scrollable
          instead. Picks up the site's existing global scrollbar style
          (app/globals.css) automatically — nothing custom needed here.
          overscroll-contain: without it, once the sidebar's own scroll
          hits bottom, leftover wheel/trackpad input "chains" up to the
          page and scrolls the main content too — jarring since the
          sidebar is sticky, not fixed, so it then drifts out of place
          along with the page. This stops scroll input at the sidebar's
          own boundary instead of leaking past it. */}
      <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-72 shrink-0 overflow-y-auto overscroll-contain rounded-3xl border border-bone/10 bg-panel p-5 shadow-sm lg:block">
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
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto overscroll-contain border-r border-bone/10 bg-panel p-6 lg:hidden"
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
