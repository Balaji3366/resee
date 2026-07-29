"use client";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Software Engineering Student",
    initials: "RS",
    review:
      "RESEE helped me improve my ATS score from 58% to 91%. The AI suggestions were incredibly useful.",
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
    <section className="relative overflow-hidden bg-ink py-28">

      {/* Background Glow */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-amber/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-teal/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="inline-flex rounded-full border border-amber/30 bg-amber/10 px-6 py-2 text-sm font-bold uppercase tracking-wider text-amber">
            ⭐ Testimonials
          </span>

          <h2 className="font-display mt-8 text-5xl font-extrabold text-bone md:text-6xl">
            Loved By Career Aspirants
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate">
            Thousands of learners trust RESEE to improve resumes,
            prepare for interviews and grow their careers with AI.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {testimonials.map((item) => (

            <div
              key={item.name}
              className="group relative overflow-hidden rounded-[32px] border border-amber/20 bg-panel p-8 shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
            >

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

              <div className="flex items-center gap-5">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-bone to-amber-dim text-xl font-bold text-amber shadow-lg">
                  {item.initials}
                </div>

                <div>

                  <h3 className="text-xl font-bold text-bone">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate">
                    {item.role}
                  </p>

                </div>

              </div>

              <div className="mt-8 flex gap-1 text-2xl text-amber">
                {"★".repeat(item.rating)}
              </div>

              <p className="mt-8 text-lg leading-8 text-slate italic">
                "{item.review}"
              </p>

              <div className="mt-8 border-t border-bone/15 pt-6">
                                <div className="flex items-center justify-between">

                  <span className="text-sm font-medium text-slate">
                    Verified Review
                  </span>

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-teal" />

                    <span className="text-sm font-semibold text-teal">
                      AI Verified
                    </span>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Bottom Trust Section */}

        <div className="mt-20 rounded-[32px] border border-amber/20 bg-gradient-to-r from-bone via-amber to-amber-dim px-8 py-10 text-center shadow-2xl">

          <h3 className="text-3xl font-bold text-white">
            Join Thousands of Learners Building Their Careers
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate">
            RESEE helps students and professionals improve resumes,
            prepare for interviews, and grow with AI-powered career guidance.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">

            <div className="text-center">
              <h4 className="text-4xl font-extrabold text-amber">
                10K+
              </h4>
              <p className="mt-2 text-slate">
                Active Users
              </p>
            </div>

            <div className="hidden h-12 w-px bg-panel/20 md:block" />

            <div className="text-center">
              <h4 className="text-4xl font-extrabold text-amber">
                95%
              </h4>
              <p className="mt-2 text-slate">
                ATS Improvement
              </p>
            </div>

            <div className="hidden h-12 w-px bg-panel/20 md:block" />

            <div className="text-center">
              <h4 className="text-4xl font-extrabold text-amber">
                ★ 4.9
              </h4>
              <p className="mt-2 text-slate">
                User Rating
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}