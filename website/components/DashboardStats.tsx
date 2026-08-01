"use client";

import CountUp from "react-countup";

type DashboardStatsProps = {
  resumeCount: number;
  documentCount: number;
};

export default function DashboardStats({ resumeCount, documentCount }: DashboardStatsProps) {
  const stats = [
    {
      title: "Resume Reports",
      value: resumeCount,
      color: "text-amber",
    },
    {
      title: "Documents",
      value: documentCount,
      color: "text-amber-dim",
    },
    {
      title: "Mock Interviews",
      value: 0,
      color: "text-bone/25",
    },
    {
      title: "Career Roadmaps",
      value: 0,
      color: "text-bone/25",
    },
  ];

  return (
    <section className="mt-12">
      <h2 className="font-display mb-6 text-2xl font-extrabold text-bone">Dashboard Overview</h2>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.title} className="rounded-[20px] border-2 border-bone bg-panel p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-bone/45">
              {item.title}
            </p>

            <p className={`font-display mt-3 text-4xl font-extrabold ${item.color}`}>
              <CountUp end={item.value} duration={1.5} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
