"use client";

import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for students getting started.",
    features: [
      "Resume Analyzer",
      "Basic ATS Report",
      "Limited AI Usage",
      "Community Support",
    ],
    button: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹199/mo",
    description: "For serious job seekers.",
    features: [
      "Everything in Free",
      "AI Resume Builder",
      "Mock Interviews",
      "Career Roadmaps",
      "Unlimited AI Usage",
      "Priority Support",
    ],
    button: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "For colleges & Organisations.",
    features: [
      "Everything in Pro",
      "Team Dashboard",
      "Analytics",
      "Dedicated Support",
      "Custom Integrations",
    ],
    button: "Contact Sales",
    popular: false,
  },
];

export default function Plans() {
  const router = useRouter();

  return (
    <section
      id="plans"
      className="relative overflow-hidden bg-white py-28"
    >
      {/* Background Glow */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-2 text-sm font-bold uppercase tracking-wider text-[#8B6B00]">
            💎 Pricing
          </span>

          <h2 className="mt-8 text-5xl font-extrabold text-[#06281F] md:text-6xl">
            Choose Your Plan
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-gray-600">
            Start free today and upgrade whenever you're ready to unlock
            advanced AI tools for your career growth.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {plans.map((plan) => (

            <div
              key={plan.name}
              className={`group relative overflow-hidden rounded-[32px] border p-10 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] ${
                plan.popular
                  ? "scale-105 border-[#D4AF37] bg-[#06281F] text-white shadow-2xl"
                  : "border-[#D4AF37]/20 bg-white shadow-xl"
              }`}
            >

              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

              {plan.popular && (
                <div className="absolute right-6 top-6 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#06281F] shadow-lg">
                  ⭐ Most Popular
                </div>
              )}

              <h3
                className={`text-3xl font-bold ${
                  plan.popular ? "text-white" : "text-[#06281F]"
                }`}
              >
                {plan.name}
              </h3>

              <div className="mt-6">

                <span
                  className={`text-5xl font-extrabold ${
                    plan.popular
                      ? "text-[#D4AF37]"
                      : "text-[#06281F]"
                  }`}
                >
                  {plan.price}
                </span>

              </div>

              <p
                className={`mt-5 leading-7 ${
                  plan.popular
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 space-y-4">
                                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                      plan.popular
                        ? "bg-white/5"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                      ✓
                    </div>

                    <span
                      className={`font-medium ${
                        plan.popular
                          ? "text-gray-100"
                          : "text-gray-700"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}

              </div>

              <button
                onClick={() => router.push("/signup")}
                className={`mt-10 w-full rounded-2xl py-4 text-base font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#D4AF37] text-[#06281F] hover:scale-[1.03] hover:shadow-xl"
                    : "bg-[#06281F] text-white hover:bg-[#14532D] hover:scale-[1.02]"
                }`}
              >
                {plan.button}
              </button>

              <div
                className={`mt-8 flex items-center justify-between border-t pt-6 ${
                  plan.popular
                    ? "border-white/10"
                    : "border-gray-200"
                }`}
              >
                <span
                  className={`text-sm ${
                    plan.popular
                      ? "text-gray-300"
                      : "text-gray-500"
                  }`}
                >
                  Secure Payments
                </span>

                <div className="flex items-center gap-2">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      plan.popular
                        ? "animate-pulse bg-emerald-400"
                        : "bg-emerald-500"
                    }`}
                  />

                  <span
                    className={`text-sm font-semibold ${
                      plan.popular
                        ? "text-emerald-300"
                        : "text-emerald-600"
                    }`}
                  >
                    Always Available
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
              
              