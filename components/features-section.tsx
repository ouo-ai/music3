"use client";

import React from "react"

import { motion } from "framer-motion";
import { PenLine, Mic2, Layers, Sliders, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: "1",
    icon: <PenLine className="w-5 h-5 text-white" />,
    title: "Lyrics-to-Song",
    description:
      "Paste your own lyrics or start from a single line. Music 3.0 structures verses, hooks, and choruses into a complete song.",
  },
  {
    id: "2",
    icon: <Mic2 className="w-5 h-5 text-white" />,
    title: "Vocal Generation",
    description:
      "Choose a vocal character and let the model perform your lyrics with natural phrasing, pitch, and emotion — or generate instrumental-only.",
  },
  {
    id: "3",
    icon: <Sparkles className="w-5 h-5 text-white" />,
    title: "Style & Reference Control",
    description:
      "Steer the output with a genre, mood, or a reference track. Blend two styles to land on a sound that's entirely yours.",
  },
  {
    id: "4",
    icon: <Layers className="w-5 h-5 text-white" />,
    title: "Full Arrangement",
    description:
      "Every generation includes structured instrumentation — drums, bass, harmony, and lead lines arranged to fit the song's dynamics.",
  },
  {
    id: "5",
    icon: <Sliders className="w-5 h-5 text-white" />,
    title: "Section Regeneration",
    description:
      "Keep the chorus you love and regenerate just the bridge or second verse. Fine-tune a track without starting over.",
  },
  {
    id: "6",
    icon: <Download className="w-5 h-5 text-white" />,
    title: "Stem Export",
    description:
      "Download a finished mix or separated stems for vocals, drums, and instrumentation to take into your own production.",
  },
];

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

interface FeaturesSectionProps {
  preHeading?: string;
  headline?: string;
  features?: FeatureItem[];
  className?: string;
}

export function FeaturesSection({
  preHeading = "Key Capabilities",
  headline = "Everything a Song Needs, Generated at Once",
  features = DEFAULT_FEATURES,
  className,
}: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className={cn(
        "w-full bg-zinc-900 py-24 border-b border-zinc-700/30",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 mb-16"
        >
          <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
            <div className="w-2.5 h-2.5 bg-amber-500" />
            <span className="text-sm font-medium text-zinc-400 tracking-wide">
              {preHeading}
            </span>
          </div>
          <h2 className="text-balance text-white text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] max-w-[700px] tracking-tight">
            {headline.split(" ").map((word, i) => (
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
          </h2>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-16"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="flex flex-col group"
            >
              {/* Icon */}
              <div className="mb-8">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-b from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20 transform transition-transform group-hover:scale-110 duration-300">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3">
                <h4 className="text-white text-xl font-medium tracking-tight font-sans">
                  {feature.title}
                </h4>
                <p className="text-balance text-zinc-400 text-base leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-white text-zinc-900 hover:bg-zinc-200 px-8"
            asChild
          >
            <a href="/generate">Explore Full Features</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-zinc-600 text-white hover:bg-zinc-800 bg-transparent px-8"
            asChild
          >
            <a href="#pricing">See Pricing</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
