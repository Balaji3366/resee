"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  ListChecks,
  ClipboardList,
  Mic,
  Briefcase,
  FileBadge,
  FolderOpen,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Users", icon: Users },
  { label: "Learning Paths", icon: BookOpen, href: "/admin/learning-paths" },
  { label: "Categories", icon: FolderTree, href: "/admin/categories" },
  { label: "Practice Topics", icon: ListChecks, href: "/admin/practice" },
  { label: "Mock Tests", icon: ClipboardList, href: "/admin/practice/mock-tests" },
  { label: "Mock Interviews", icon: Mic, href: "/admin/interviews" },
  { label: "Jobs", icon: Briefcase, href: "/admin/jobs" },
  { label: "AI Platform", icon: Sparkles, href: "/admin/ai" },
  { label: "Resume Templates", icon: FileBadge },
  { label: "Documents", icon: FolderOpen },
  { label: "Notifications", icon: Bell },
  { label: "Analytics", icon: BarChart3 },
  { label: "Roles", icon: ShieldCheck },
  { label: "Settings", icon: SettingsIcon },
];

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        if (!item.href) {
          return (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-xl bg-panel-2 px-4 py-3 text-slate"
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
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
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
              isActive ? "bg-amber text-white" : "text-bone hover:bg-panel-2/40"
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

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="sticky top-24 hidden h-fit w-64 shrink-0 rounded-3xl border border-amber/20 bg-panel p-4 shadow-md lg:block">
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
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-panel p-6 shadow-2xl lg:hidden"
            >
              <NavList pathname={pathname} onNavigate={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
