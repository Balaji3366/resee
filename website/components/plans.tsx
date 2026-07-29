"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for students getting started.",
    features: [
      { label: "Basic AI Chat", comingSoon: false },
      { label: "Learning Roadmaps", comingSoon: true },
      { label: "ATS Check", comingSoon: false },
    ],
    button: "Get Started",
    popular: false,
    comingSoon: false,
  },
  {
    name: "Pro",
    price: "₹199/mo",
    description: "For serious job seekers.",
    features: [
      { label: "Everything in Free", comingSoon: false },
      { label: "Unlimited Mock Interviews", comingSoon: true },
      { label: "AI Project Studio", comingSoon: true },
      { label: "Career Memory", comingSoon: false },
      { label: "Company-Specific Prep", comingSoon: true },
    ],
    button: "Upgrade to Pro",
    popular: true,
    comingSoon: false,
  },
  {
    name: "Credit Packs",
    price: "From ₹99",
    description: "Micro-transactions for specific resume re-writes or mock interviews.",
    features: [
      { label: "Resume Re-writes — pay per use", comingSoon: false },
      { label: "Mock Interview Credits — pay per use", comingSoon: false },
      { label: "50 Credits Pack — ₹99", comingSoon: false },
      { label: "200 Credits Pack — ₹299", comingSoon: false },
      { label: "Credits never expire", comingSoon: false },
    ],
    button: "View Credit Packs",
    popular: false,
    comingSoon: true,
  },
];

export default function Plans() {
  const router = useRouter();

  return (
    <section
      id="plans"
      className="relative overflow-hidden bg-panel py-28"
    >
      {/* Background Glow */}

      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-amber/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-teal/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-7xl px-6"
      >

        <div className="text-center">

          <span className="inline-flex rounded-full border border-amber/30 bg-amber/10 px-6 py-2 text-sm font-bold uppercase tracking-wider text-amber">
            💎 Pricing
          </span>

          <h2 className="font-display mt-8 text-5xl font-extrabold text-bone md:text-6xl">
            Choose Your Plan
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate">
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
                  ? "scale-105 border-amber bg-panel-2 text-white shadow-2xl"
                  : "border-amber/20 bg-panel shadow-xl"
              }`}
            >

              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

              {plan.popular && (
                <div className="absolute right-6 top-6 rounded-full bg-amber px-4 py-2 text-xs font-bold uppercase tracking-wide text-bone shadow-lg">
                  ⭐ Most Popular
                </div>
              )}

              <h3
                className={`text-3xl font-bold ${
                  plan.popular ? "text-white" : "text-bone"
                }`}
              >
                {plan.name}
              </h3>

              <div className="mt-6">

                <span
                  className={`text-5xl font-extrabold ${
                    plan.popular
                      ? "text-amber"
                      : "text-bone"
                  }`}
                >
                  {plan.price}
                </span>

              </div>

              <p
                className={`mt-5 leading-7 ${
                  plan.popular
                    ? "text-slate"
                    : "text-slate"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 space-y-4">
                                {plan.features.map((feature) => (
                  <div
                    key={feature.label}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                      plan.popular
                        ? "bg-panel/5"
                        : "bg-panel"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        feature.comingSoon
                          ? "bg-panel-2 text-slate"
                          : "bg-teal text-white"
                      }`}
                    >
                      {feature.comingSoon ? "⏳" : "✓"}
                    </div>

                    <span
                      className={`font-medium ${
                        plan.popular
                          ? "text-white/90"
                          : "text-bone"
                      }`}
                    >
                      {feature.label}
                      {feature.comingSoon && (
                        <span className="ml-1 text-xs font-normal text-slate">
                          (Soon)
                        </span>
                      )}
                    </span>
                  </div>
                ))}

              </div>

              <button
                onClick={() => {
                  if (plan.comingSoon) {
                    alert("🚧 Coming Soon");
                  } else {
                    router.push("/signup");
                  }
                }}
                className={`mt-10 w-full rounded-2xl py-4 text-base font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-amber text-bone hover:scale-[1.03] hover:shadow-xl"
                    : "bg-amber text-bone hover:bg-amber-dim hover:scale-[1.02]"
                }`}
              >
                {plan.button}
              </button>

              <div
                className={`mt-8 flex items-center justify-between border-t pt-6 ${
                  plan.popular
                    ? "border-white/10"
                    : "border-bone/15"
                }`}
              >
                <span
                  className={`text-sm ${
                    plan.popular
                      ? "text-slate"
                      : "text-slate"
                  }`}
                >
                  Secure Payments
                </span>

                <div className="flex items-center gap-2">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      plan.popular
                        ? "animate-pulse bg-teal"
                        : "bg-teal"
                    }`}
                  />

                  <span
                    className={`text-sm font-semibold ${
                      plan.popular
                        ? "text-teal"
                        : "text-teal"
                    }`}
                  >
                    Always Available
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </motion.div>

    </section>
  );
}