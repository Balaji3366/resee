"use client";

import { useRouter } from "next/navigation";

const features = [
  {
    icon: "📄",
    title: "AI Resume Analyzer",
    desc: "Upload your resume and receive an ATS score, strengths, weaknesses and AI-powered improvement suggestions.",
    link: "/resume",
    available: true,
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: "📝",
    title: "AI Resume Builder",
    desc: "Create professional ATS-friendly resumes with AI assistance.",
    link: "#",
    available: false,
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: "🎤",
    title: "Mock Interviews",
    desc: "Practice HR and technical interviews with instant AI feedback.",
    link: "#",
    available: false,
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: "🧭",
    title: "Career Roadmaps",
    desc: "Generate personalized learning roadmaps based on your career goals.",
    link: "#",
    available: false,
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: "📈",
    title: "Skill Gap Analysis",
    desc: "Identify missing skills and receive a learning plan tailored to your profile.",
    link: "#",
    available: false,
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: "💼",
    title: "Job Match",
    desc: "Find jobs that best match your skills, experience and career aspirations.",
    link: "#",
    available: false,
    color: "from-cyan-500 to-teal-600",
  },
];

export default function Features() {
  const router = useRouter();

  const handleClick = (feature: (typeof features)[0]) => {
    if (feature.available) {
      router.push(feature.link);
    } else {
      alert("🚧 Coming Soon");
    }
  };

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#F8FAF8] py-28"
    >
      {/* Background */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-2 text-sm font-bold uppercase tracking-wider text-[#8B6B00]">
            ✨ Powerful AI Features
          </span>

          <h2 className="mt-8 text-5xl font-extrabold leading-tight text-[#06281F] md:text-6xl">
            Everything You Need
            <br />
            To Build Your Career
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-600">
            Mentora combines powerful AI tools to analyse resumes,
            prepare interviews,
            generate learning roadmaps,
            discover skill gaps,
            and accelerate your career journey.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (

            <div
                key={feature.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-[#D4AF37]/20 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
              >

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

              <div
                className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.color} text-4xl shadow-xl transition duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                {feature.icon}
              </div>

              <div className="mt-8 flex items-center justify-between">

                <h3 className="text-2xl font-bold text-[#06281F]">
                  {feature.title}
                </h3>

                {feature.available ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    LIVE
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    SOON
                  </span>
                )}

              </div>

              <p className="mt-5 h-[140px] leading-8 text-gray-600">
                {feature.desc}
              </p>

              <div className="mt-8 h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className={`h-full rounded-full bg-gradient-to-r ${feature.color}`}
                  style={{
                    width: feature.available ? "100%" : "65%",
                  }}
                />

              </div>
                            <div className="mt-auto pt-8">

                <button
                  onClick={() => handleClick(feature)}
                  className={`group/button inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] ${
                    feature.available
                      ? "bg-[#06281F] hover:bg-[#14532D]"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  <span>
                    {feature.available ? "Open Feature" : "Coming Soon"}
                  </span>

                  <span className="ml-2 transition-transform duration-300 group-hover/button:translate-x-1">
                    →
                  </span>

                </button>

              </div>

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">

                <span className="text-sm font-medium text-gray-500">
                  AI Powered
                </span>

                <div className="flex items-center gap-2">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      feature.available
                        ? "animate-pulse bg-emerald-500"
                        : "bg-amber-400"
                    }`}
                  />

                  <span
                    className={`text-sm font-semibold ${
                      feature.available
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {feature.available ? "Available" : "In Progress"}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}