"use client";

import {
  FileText,
  FolderOpen,
  Mic,
  Map,
  TrendingUp,
} from "lucide-react";
import CountUp from "react-countup";

type DashboardStatsProps = {
  resumeCount: number;
  documentCount: number;
};

export default function DashboardStats({
  resumeCount,
  documentCount,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Resume Reports",
      value: resumeCount,
      icon: FileText,
      color: "text-amber",
      bg: "bg-panel",
      border: "border-teal/30",
    },
    {
      title: "Documents",
      value: documentCount,
      icon: FolderOpen,
      color: "text-teal",
      bg: "bg-panel-2",
      border: "border-teal/30",
    },
    {
      title: "Mock Interviews",
      value: 0,
      icon: Mic,
      color: "text-amber",
      bg: "bg-panel-2",
      border: "border-amber/20",
      badge: "Coming Soon",
    },
    {
      title: "Career Roadmaps",
      value: 0,
      icon: Map,
      color: "text-slate",
      bg: "bg-panel-2",
      border: "border-bone/15",
      badge: "Coming Soon",
    },
  ];

  return (
    <section className="mt-12">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="font-display text-3xl font-bold text-bone">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-slate">
            Track your activity across RESEE.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-2xl bg-panel px-4 py-2 lg:flex">
          <TrendingUp className="text-amber" size={18} />
          <span className="font-semibold text-amber">
            AI Powered
          </span>
        </div>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`group rounded-3xl border ${item.border} bg-panel p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg}`}
              >
                <Icon className={item.color} size={30} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-slate">
                {item.title}
              </h3>

              <div className="mt-3 flex items-end justify-between">

                <p className={`text-5xl font-extrabold ${item.color}`}>
                    <CountUp
                        end={item.value}
                        duration={1.5}
                    />
                    </p>

                {item.badge && (
                  <span className="rounded-full bg-panel-2 px-3 py-1 text-xs font-bold text-slate">
                    {item.badge}
                  </span>
                )}

              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-panel-2">
                <div
                  className={`h-full rounded-full ${
                    item.value > 0
                      ? "w-full bg-amber"
                      : "w-1/4 bg-amber"
                  }`}
                />
              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}