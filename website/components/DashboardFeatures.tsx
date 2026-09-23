"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  FileSearch,
  Mic,
  FolderOpen,
  FilePlus2,
  Map,
  Target,
} from "lucide-react";
import IconBadge from "@/components/ui/IconBadge";

/**
 * These are utilities, not the core dashboard experience (Today's
 * Focus and Career Health Score are) — was previously a grid of
 * medium cards with icon + title + wrapped description + full-width
 * button, roughly the same visual weight as the primary sections
 * above it. Now compact single-line rows: same 7 tools, same
 * routes/enabled flags, but each takes ~1/3 the vertical space and a
 * de-emphasized label heading instead of a bold h2, so this section
 * reads as secondary at a glance rather than competing with what's
 * above it.
 */
const TOOLS = [
  {
    title: "AI Career Chat",
    description: "Chat with RESEE AI about your career",
    icon: MessageSquare,
    href: "/chat",
    enabled: true,
  },
  {
    title: "Resume Analyzer",
    description: "ATS scoring and AI feedback",
    icon: FileSearch,
    href: "/resume",
    enabled: true,
  },
  {
    title: "Mock Interview",
    description: "Role-specific practice interview",
    icon: Mic,
    href: "/interviews",
    enabled: true,
  },
  {
    title: "Documents",
    description: "Upload, organize and chat with files",
    icon: FolderOpen,
    href: "/documents",
    enabled: true,
  },
  {
    title: "Resume Builder",
    description: "Generate an ATS-ready resume",
    icon: FilePlus2,
    href: "/resumes",
    enabled: true,
  },
  {
    title: "Career Roadmap",
    description: "Step-by-step career plans",
    icon: Map,
    href: null,
    enabled: false,
  },
  {
    title: "Skill Gap Analysis",
    description: "Find missing skills for your goal",
    icon: Target,
    href: null,
    enabled: false,
  },
];

export default function DashboardFeatures() {
  return (
    <section className="mt-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-bone/40">
        AI Career Tools
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => {
          const inner = (
            <>
              <IconBadge color="amber-dim" size={34}>
                <tool.icon size={16} />
              </IconBadge>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-bone">{tool.title}</p>
                <p className="truncate text-xs text-bone/50">{tool.description}</p>
              </div>

              {tool.enabled && tool.href ? (
                <span
                  aria-hidden="true"
                  className="-my-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-bone/50 transition group-hover:bg-bone/5 group-hover:text-amber"
                >
                  <ArrowRight size={18} />
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-panel-2 px-2 py-0.5 text-[9px] font-bold text-slate">
                  Soon
                </span>
              )}
            </>
          );

          if (tool.enabled && tool.href) {
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="focus-ring group flex cursor-pointer items-center gap-3 rounded-xl border border-bone/10 bg-panel px-4 py-3.5 transition-all duration-200 hover:-translate-y-px hover:border-amber/30 hover:shadow-sm"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={tool.title}
              className="flex items-center gap-3 rounded-xl border border-bone/10 bg-panel px-4 py-3.5 opacity-60"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
