"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number | string;
  priceYearly: number | string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  type: "subscription" | "free";
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description:
      "Try the generator with limited monthly songs and explore styles before you commit.",
    features: [
      "10 song generations / month",
      "Standard vocal & instrumental modes",
      "Watermarked exports",
      "Community styles library",
    ],
    cta: "Start for Free",
    type: "free",
  },
  {
    id: "creator",
    name: "Creator",
    priceMonthly: 19,
    priceYearly: 15,
    description:
      "For songwriters and producers turning ideas into finished, shareable tracks every week.",
    features: [
      "Unlimited song generations",
      "Full vocal & lyrics-to-song tools",
      "Section regeneration",
      "Clean, unwatermarked exports",
      "Priority generation queue",
    ],
    cta: "Start Creating",
    popular: true,
    type: "subscription",
  },
  {
    id: "studio",
    name: "Studio",
    priceMonthly: 49,
    priceYearly: 39,
    description:
      "For studios and teams producing at volume with stems, licensing, and collaboration.",
    features: [
      "Everything in Creator",
      "Multi-track stem export",
      "Commercial usage license",
      "Team workspace & shared projects",
      "Early access to new voices & styles",
    ],
    cta: "Start Studio Plan",
    type: "subscription",
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="w-full bg-zinc-900 py-24 md:py-32 border-b border-zinc-700/30"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
            <div className="w-2.5 h-2.5 bg-amber-500" />
            <span className="text-sm font-medium text-zinc-400 tracking-wide">Pricing</span>
          </div>
          <h2 className="text-balance text-4xl md:text-5xl tracking-tight leading-tight font-normal text-white">
            <span className="block">
              {"Choose the plan".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ filter: "blur(10px)", opacity: 0 }}
                  whileInView={{ filter: "blur(0px)", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block text-zinc-500">
              {"that matches your sound".split(" ").map((word, i) => (
                <motion.span
                  key={i + 3}
                  initial={{ filter: "blur(10px)", opacity: 0 }}
                  whileInView={{ filter: "blur(0px)", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i + 3) * 0.05 }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h2>
        </div>

        {/* Switch and Plans Container */}
        <div className="flex flex-col gap-10 w-full">
          {/* Billing Toggle */}
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "text-lg transition-colors duration-200",
                !isYearly ? "text-white" : "text-zinc-500"
              )}
            >
              Monthly
            </span>

            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 bg-zinc-800 cursor-pointer p-1"
            >
              <motion.div
                animate={{
                  x: isYearly ? 24 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="w-4 h-4 bg-white"
              />
            </button>

            <span
              className={cn(
                "text-lg transition-colors duration-200",
                isYearly ? "text-white" : "text-zinc-500"
              )}
            >
              Yearly
            </span>

            <div className="bg-amber-500/10 px-3 py-1.5 border border-amber-500/20">
              <span className="text-xs font-medium text-amber-500">
                20% OFF
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{
                  scale: 1.02,
                }}
                className={cn(
                  "relative flex flex-col gap-6 p-6 transition-all duration-300",
                  plan.popular
                    ? "bg-zinc-800 border border-amber-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    : "bg-zinc-800/50 border border-zinc-700/50"
                )}
              >
                {/* Card Head */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-normal text-white">
                      {plan.name}
                    </span>
                    {plan.popular && (
                      <div className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-1">
                        <span className="text-xs font-medium text-amber-500">
                          Popular
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <h3 className="text-4xl font-normal text-white tracking-tighter">
                      {`$${isYearly ? plan.priceYearly : plan.priceMonthly}`}
                    </h3>
                    {plan.type === "subscription" && (
                      <span className="text-sm text-zinc-500">/month</span>
                    )}
                    {plan.type === "free" && (
                      <span className="text-sm text-zinc-500">forever</span>
                    )}
                  </div>

                  <p className="text-balance text-sm leading-relaxed text-zinc-400 min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  className={cn(
                    "w-full py-3 px-4 text-sm font-medium transition-all duration-200 cursor-pointer",
                    plan.popular
                      ? "bg-white text-zinc-900 hover:bg-zinc-200"
                      : "bg-transparent text-white border border-zinc-600 hover:bg-white/5"
                  )}
                >
                  {plan.cta}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-zinc-700" />
                  <span className="text-xs text-zinc-500 shrink-0">
                    Features
                  </span>
                  <div className="flex-1 h-[1px] bg-zinc-700" />
                </div>

                {/* Features List */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 group">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
