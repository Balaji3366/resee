"use client";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Software Engineering Student",
    initials: "RS",
    review:
      "Mentora helped me improve my ATS score from 58% to 91%. The AI suggestions were incredibly useful.",
    rating: 5,
  },
  {
    name: "Priya Reddy",
    role: "Frontend Developer",
    initials: "PR",
    review:
      "The resume analysis was detailed and easy to understand. I finally started getting interview calls.",
    rating: 5,
  },
  {
    name: "Arjun Kumar",
    role: "Recent Graduate",
    initials: "AK",
    review:
      "I'm excited for the upcoming interview and roadmap features. Even the current resume analyser is worth using.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAF8] py-28">

      {/* Background Glow */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-2 text-sm font-bold uppercase tracking-wider text-[#8B6B00]">
            ⭐ Testimonials
          </span>

          <h2 className="mt-8 text-5xl font-extrabold text-[#06281F] md:text-6xl">
            Loved By Career Aspirants
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-600">
            Thousands of learners trust Mentora to improve resumes,
            prepare for interviews and grow their careers with AI.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {testimonials.map((item) => (

            <div
              key={item.name}
              className="group relative overflow-hidden rounded-[32px] border border-[#D4AF37]/20 bg-white p-8 shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
            >

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

              <div className="flex items-center gap-5">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#06281F] to-[#14532D] text-xl font-bold text-[#D4AF37] shadow-lg">
                  {item.initials}
                </div>

                <div>

                  <h3 className="text-xl font-bold text-[#06281F]">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.role}
                  </p>

                </div>

              </div>

              <div className="mt-8 flex gap-1 text-2xl text-[#D4AF37]">
                {"★".repeat(item.rating)}
              </div>

              <p className="mt-8 text-lg leading-8 text-gray-600 italic">
                "{item.review}"
              </p>

              <div className="mt-8 border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between">

                  <span className="text-sm font-medium text-gray-500">
                    Verified Review
                  </span>

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

                    <span className="text-sm font-semibold text-emerald-600">
                      AI Verified
                    </span>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Bottom Trust Section */}

        <div className="mt-20 rounded-[32px] border border-[#D4AF37]/20 bg-gradient-to-r from-[#06281F] via-[#0A3B2E] to-[#14532D] px-8 py-10 text-center shadow-2xl">

          <h3 className="text-3xl font-bold text-white">
            Join Thousands of Learners Building Their Careers
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-gray-300">
            Mentora helps students and professionals improve resumes,
            prepare for interviews, and grow with AI-powered career guidance.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">

            <div className="text-center">
              <h4 className="text-4xl font-extrabold text-[#D4AF37]">
                10K+
              </h4>
              <p className="mt-2 text-gray-300">
                Active Users
              </p>
            </div>

            <div className="hidden h-12 w-px bg-white/20 md:block" />

            <div className="text-center">
              <h4 className="text-4xl font-extrabold text-[#D4AF37]">
                95%
              </h4>
              <p className="mt-2 text-gray-300">
                ATS Improvement
              </p>
            </div>

            <div className="hidden h-12 w-px bg-white/20 md:block" />

            <div className="text-center">
              <h4 className="text-4xl font-extrabold text-[#D4AF37]">
                ★ 4.9
              </h4>
              <p className="mt-2 text-gray-300">
                User Rating
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}