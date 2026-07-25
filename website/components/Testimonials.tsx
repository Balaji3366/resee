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
    <section className="bg-[#F8FAF8] py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="rounded-full bg-[#D4AF37]/20 px-5 py-2 text-sm font-semibold text-[#8B6B00]">
            TESTIMONIALS
          </span>

          <h2 className="mt-6 text-5xl font-extrabold text-[#06281F]">
            Loved By Career Aspirants
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            See what students and professionals say about Mentora.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {testimonials.map((item) => (

            <div
              key={item.name}
              className="rounded-3xl border border-[#D4AF37]/20 bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#06281F] text-lg font-bold text-[#D4AF37]">
                  {item.initials}
                </div>

                <div>
                  <h3 className="font-bold text-[#06281F]">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.role}
                  </p>
                </div>

              </div>

              <div className="mt-6 flex text-xl text-[#D4AF37]">
                {"★★★★★"}
              </div>

              <p className="mt-6 leading-8 text-gray-600">
                "{item.review}"
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}