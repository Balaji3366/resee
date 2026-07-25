"use client";

const stats = [
  {
    value: "10K+",
    label: "Career Aspirants",
  },
  {
    value: "25K+",
    label: "Resumes Analysed",
  },
  {
    value: "5K+",
    label: "Interview Sessions",
  },
  {
    value: "95%",
    label: "User Satisfaction",
  },
];

export default function Stats() {
  return (
    <section className="bg-[#06281F] py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="rounded-full bg-[#D4AF37]/20 px-5 py-2 text-sm font-semibold text-[#D4AF37]">
            OUR IMPACT
          </span>

          <h2 className="mt-6 text-5xl font-extrabold text-white">
            Trusted By Future Professionals
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            Thousands of students, freshers and professionals use Mentora
            to improve their resumes, prepare for interviews and grow their careers.
          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((item) => (

            <div
              key={item.label}
              className="rounded-3xl border border-[#D4AF37]/20 bg-white/5 p-10 text-center backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-[#D4AF37] hover:bg-white/10"
            >

              <h3 className="text-5xl font-extrabold text-[#D4AF37]">
                {item.value}
              </h3>

              <p className="mt-4 text-lg text-gray-300">
                {item.label}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}