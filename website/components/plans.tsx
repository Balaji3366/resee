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
    description: "For colleges & organisations.",
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
      className="bg-white py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="rounded-full bg-[#D4AF37]/20 px-5 py-2 text-sm font-semibold text-[#8B6B00]">
            PRICING
          </span>

          <h2 className="mt-6 text-5xl font-extrabold text-[#06281F]">
            Choose Your Plan
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Start free and upgrade when you're ready to accelerate your career.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {plans.map((plan) => (

            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-3xl border p-10 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl ${
                plan.popular
                  ? "scale-105 border-[#D4AF37] bg-[#06281F] text-white shadow-2xl"
                  : "border-gray-300 bg-white text-[#06281F] shadow-xl hover:border-[#D4AF37]"
              }`}
            >
              {plan.popular && (
                <span className="absolute right-6 top-6 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-bold text-[#06281F] shadow">
                  ⭐ MOST POPULAR
                </span>
              )}

              <h3
                className={`text-3xl font-bold ${
                  plan.popular ? "text-white" : "text-[#06281F]"
                }`}
              >
                {plan.name}
              </h3>

              <p
                className={`mt-4 text-5xl font-extrabold ${
                  plan.popular ? "text-[#D4AF37]" : "text-[#06281F]"
                }`}
              >
                {plan.price}
              </p>

              <p
                className={`mt-3 ${
                  plan.popular ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="text-green-500 font-bold">✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push("/signup")}
                className={`mt-10 w-full rounded-xl py-3 font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#D4AF37] text-[#06281F] hover:scale-105 hover:shadow-lg"
                    : "bg-[#06281F] text-white hover:bg-[#14532D]"
                }`}
              >
                {plan.button}
              </button>
            </div>

          ))}

        </div>

      </div>
    </section>
  );
}