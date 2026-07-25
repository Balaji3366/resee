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
      color: "text-[#0A3B2E]",
      bg: "bg-[#EEF7F2]",
      border: "border-emerald-200",
    },
    {
      title: "Documents",
      value: documentCount,
      icon: FolderOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Mock Interviews",
      value: 0,
      icon: Mic,
      color: "text-[#D4AF37]",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badge: "Coming Soon",
    },
    {
      title: "Career Roadmaps",
      value: 0,
      icon: Map,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
      badge: "Coming Soon",
    },
  ];

  return (
    <section className="mt-12">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold text-[#06281F]">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-gray-600">
            Track your activity across Mentora.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-2xl bg-[#EEF7F2] px-4 py-2 lg:flex">
          <TrendingUp className="text-[#0A3B2E]" size={18} />
          <span className="font-semibold text-[#0A3B2E]">
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
              className={`group rounded-3xl border ${item.border} bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg}`}
              >
                <Icon className={item.color} size={30} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-gray-600">
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
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                    {item.badge}
                  </span>
                )}

              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${
                    item.value > 0
                      ? "w-full bg-[#0A3B2E]"
                      : "w-1/4 bg-[#D4AF37]"
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