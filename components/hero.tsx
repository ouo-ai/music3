"use client"

import { Music2, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { GeneratorForm } from "@/components/generator-form"

// Splits text into words for the blur-in reveal animation while keeping a
// real, literal space character between words in the rendered DOM text.
function AnimatedHeading({ text }: { text: string }) {
  const words = text.split(" ").filter(Boolean)
  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <motion.span
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="inline-block"
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  )
}

export function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
        }}
      />

      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-slate-950/40" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation */}
        <nav className="relative z-50 px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Music2 className="h-5 w-5 text-amber-500" />
              <span className="font-medium">Music 3.0</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 text-sm text-white/70 lg:flex">
              <Link href="#solution" className="transition-colors hover:text-white">
                How It Works
              </Link>
              <Link href="#features" className="transition-colors hover:text-white">
                Features
              </Link>
              <Link href="#testimonials" className="transition-colors hover:text-white">
                Testimonials
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-white">
                Pricing
              </Link>
              <Link href="#faq" className="transition-colors hover:text-white">
                FAQ
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="#generator"
                className="hidden text-sm font-medium text-white transition-colors hover:text-white/80 lg:block"
              >
                Start Creating
              </Link>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white lg:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full border-t border-zinc-700/30 bg-zinc-900/95 backdrop-blur-sm lg:hidden">
              <div className="flex flex-col gap-4 px-6 py-6">
                <Link
                  href="#solution"
                  className="py-2 text-white/70 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#features"
                  className="py-2 text-white/70 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#testimonials"
                  className="py-2 text-white/70 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="#pricing"
                  className="py-2 text-white/70 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#faq"
                  className="py-2 text-white/70 transition-colors hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link
                  href="#generator"
                  className="mt-2 border-t border-zinc-700/30 py-2 font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Creating
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Content */}
        <div className="flex flex-1 flex-col items-center gap-10 px-6 pb-16 pt-12 text-center md:pt-16">
          <div>
            <h1 className="max-w-3xl text-balance text-4xl font-normal tracking-tight text-white md:text-6xl lg:text-7xl">
              <AnimatedHeading text="Music 3.0 turns your words into finished songs" />
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-balance text-center text-sm leading-relaxed text-white/70 md:text-base">
              Music 3.0 is an AI music generator that writes original songs, vocals, and instrumentals from a
              prompt, a lyric, or a reference style — arranged and ready to export in minutes.
            </p>
          </div>

          {/* Generator */}
          <div id="generator" className="flex w-full flex-col items-center">
            <GeneratorForm />
          </div>
        </div>
      </div>
    </section>
  )
}
