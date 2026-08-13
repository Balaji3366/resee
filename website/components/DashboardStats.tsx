"use client";

import CountUp from "react-countup";
import { FileText, FolderOpen, Mic, Map } from "lucide-react";
import IconBadge from "@/components/ui/IconBadge";

type DashboardStatsProps = {
  resumeCount: number;
  documentCount: number;
};

/**
 * Was 4 separate rounded-2xl/border/shadow cards stacked as their own
 * grid — 4 outer containers for what's fundamentally one "quick glance"
 * row of numbers. Now one container, four divided cells — same data,
 * same order, far less "card wall."
 */
export default function DashboardStats({ resumeCount, documentCount }: DashboardStatsProps) {
  const stats = [
    {
      title: "Resume Reports",
      value: resumeCount,
      color: "amber" as const,
      textColor: "text-amber",
      icon: FileText,
    },
    {
      title: "Documents",
      value: documentCount,
      color: "amber-dim" as const,
      textColor: "text-amber-dim",
      icon: FolderOpen,
    },
    {
      title: "Mock Interviews",
      value: 0,
      color: "teal" as const,
      textColor: "text-bone/25",
      icon: Mic,
    },
    {
      title: "Career Roadmaps",
      value: 0,
      color: "bone" as const,
      textColor: "text-bone/25",
      icon: Map,
    },
  ];

  return (
    <section className="mt-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-bone/40">
        Dashboard Overview
      </p>

      <div className="grid grid-cols-2 divide-x divide-y divide-bone/10 overflow-hidden rounded-2xl border border-bone/10 bg-panel shadow-sm sm:grid-cols-4 sm:divide-y-0">
        {stats.map((item) => (
          <div key={item.title} className="flex items-center gap-3 px-5 py-5">
            <IconBadge color={item.color} size={36}>
              <item.icon size={16} />
            </IconBadge>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-bone/45">
                {item.title}
              </p>

              <p className={`font-display text-2xl font-extrabold ${item.textColor}`}>
                <CountUp end={item.value} duration={1.2} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
