"use client";

import { useRouter } from "next/navigation";

const features = [
  {
    icon: "📄",
    title: "AI Resume Analyzer",
    desc: "Upload your resume and receive an ATS score, strengths, weaknesses and AI-powered improvement suggestions.",
    link: "/resume",
    available: true,
  },
  {
    icon: "📝",
    title: "AI Resume Builder",
    desc: "Create professional ATS-friendly resumes with AI assistance.",
    link: "#",
    available: false,
  },
  {
    icon: "🎤",
    title: "Mock Interviews",
    desc: "Practice HR and technical interviews with instant AI feedback.",
    link: "#",
    available: false,
  },
  {
    icon: "🧭",
    title: "Career Roadmaps",
    desc: "Generate personalized learning roadmaps based on your career goals.",
    link: "#",
    available: false,
  },
  {
    icon: "📈",
    title: "Skill Gap Analysis",
    desc: "Identify missing skills and receive a learning plan tailored to your profile.",
    link: "#",
    available: false,
  },
  {
    icon: "💼",
    title: "Job Match",
    desc: "Find jobs that best match your skills, experience and career aspirations.",
    link: "#",
    available: false,
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
      className="bg-[#F8FAF8] py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="rounded-full bg-[#D4AF37]/20 px-5 py-2 text-sm font-semibold text-[#8B6B00]">
            FEATURES
          </span>

          <h2 className="mt-6 text-5xl font-extrabold text-[#06281F]">
            Everything You Need
            <br />
            To Build Your Career
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Mentora combines AI tools that help you analyse resumes,
            prepare interviews, build roadmaps and accelerate your career.
          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (

            <div
              key={feature.title}
              className="group rounded-3xl border border-[#D4AF37]/20 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
            >

              <div className="flex items-center justify-between">

                <div className="text-5xl">
                  {feature.icon}
                </div>

                {feature.available ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Available
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    Coming Soon
                  </span>
                )}

              </div>

              <h3 className="mt-8 text-2xl font-bold text-[#06281F]">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {feature.desc}
              </p>

              <button
                onClick={() => handleClick(feature)}
                className="mt-8 rounded-xl bg-[#06281F] px-5 py-3 font-semibold text-white transition hover:bg-[#14532D]"
              >
                {feature.available ? "Open Feature →" : "Coming Soon"}
              </button>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}