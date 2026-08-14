"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "What is Music 3.0?",
    answer:
      "Music 3.0 is an AI music generation model and studio that turns text prompts, lyrics, style references, or a mood description into complete, original songs — including vocals, instrumentation, and arrangement, ready to export.",
  },
  {
    id: "2",
    question: "Is the generator on this page connected to a live model?",
    answer:
      "Yes. The Music 3.0 generator sends your prompt to a Kie-hosted Suno API and returns real audio when the task finishes. It is a live third-party generation path, not a first-party Music 3.0 model, and public use may be rate-limited.",
  },
  {
    id: "3",
    question: "Can Music 3.0 write and perform original lyrics?",
    answer:
      "Yes. You can paste your own lyrics for the model to perform, or describe an idea and let Music 3.0 write verses, hooks, and a chorus structure before generating vocals in your chosen style.",
  },
  {
    id: "4",
    question: "Can I generate instrumental-only tracks?",
    answer:
      "Yes. Toggle the generator to instrumental mode to get a fully arranged track — drums, bass, harmony, and lead lines — without vocals, useful for background scoring, podcasts, or beats.",
  },
  {
    id: "5",
    question: "What can I export once a song is generated?",
    answer:
      "Creator and Studio plans support exporting a finished mix or separated stems for vocals, drums, and instrumentation, so you can bring a Music 3.0 track into your own DAW for further production.",
  },
  {
    id: "6",
    question: "Do I own the rights to songs I generate?",
    answer:
      "Paid plans include a commercial usage license for tracks you generate, so you can release, publish, or sync the songs you create. Free plan exports are watermarked and intended for evaluation only.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="w-full bg-zinc-900 py-24 md:py-32 border-b border-zinc-700/30"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Header */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-4 py-2 border border-zinc-700 w-fit">
              <div className="w-2.5 h-2.5 bg-amber-500" />
              <span className="text-sm font-medium text-zinc-400 tracking-wide">
                FAQ
              </span>
            </div>
            
            <h2 className="text-balance text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.1]">
              {"Common Questions".split(" ").map((word, i) => (
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

            <p className="text-balance text-base md:text-lg text-zinc-400 leading-relaxed max-w-md">
              Get quick answers about Music 3.0&apos;s AI song generation and how the studio turns prompts
              and lyrics into finished tracks. Can&apos;t find what you&apos;re looking for? Reach out below.
            </p>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="flex flex-col">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  "border-t border-zinc-700/30",
                  index === faqs.length - 1 && "border-b"
                )}
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="w-full py-6 flex items-center justify-between gap-4 text-left group"
                >
                  <span className="text-lg md:text-xl font-normal text-white group-hover:text-zinc-300 transition-colors">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pr-12">
                        <p className="text-base leading-relaxed text-zinc-400">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
