import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Music2 } from "lucide-react"
import { Footer } from "@/components/footer"
import { GenerationStudio } from "@/components/generation-studio"

export const metadata: Metadata = {
  title: "Generate",
  description:
    "Generate Music 3.0 songs with Kie's documented Suno API: simple or custom mode, vocals or instrumental, V5_5 duration, and multiple audio variations.",
  alternates: { canonical: "/generate" },
}

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="mx-auto h-full max-w-7xl">
          <div className="relative h-full">
            <div className="absolute left-0 top-0 h-full w-px bg-zinc-700/30" />
            <div className="absolute right-0 top-0 h-full w-px bg-zinc-700/30" />
          </div>
        </div>
      </div>
      <header className="relative z-10 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Music2 className="h-5 w-5 text-amber-500" />
            <span className="font-medium">Music 3.0</span>
          </Link>
          <Link href="/#faq" className="text-sm text-white/60 hover:text-white">
            FAQ
          </Link>
        </div>
      </header>
      <main className="relative z-10">
        <Suspense fallback={<div className="px-6 py-16 text-sm text-white/50">Loading generator...</div>}>
          <GenerationStudio />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
