import type { Metadata } from "next"
import Link from "next/link"
import { Music2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms for using the Music 3.0 landing page and its live AI music generator.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12 md:py-24">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <Music2 className="h-4 w-4 text-amber-500" />
          Music 3.0
        </Link>
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Terms</p>
        <h1 className="mt-3 text-4xl font-normal tracking-tight md:text-5xl">Terms of use</h1>
        <p className="mt-4 text-sm text-zinc-500">Last updated August 14, 2026.</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-300">
          <p>
            These terms cover the public Music 3.0 website at music3.ai. The first-screen generator creates real audio
            through a Kie-hosted Suno API. Generated files come from that provider and do not by themselves grant a
            separate commercial license from Music 3.0.
          </p>
          <section>
            <h2 className="text-xl text-white">Third-party generation</h2>
            <p className="mt-2 text-zinc-400">
              Pricing, export, and licensing copy on the landing page describes the intended Music 3.0 studio product.
              The public generator is a live third-party path via Kie/Suno and may be rate-limited or disabled without
              notice.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-white">Acceptable use</h2>
            <p className="mt-2 text-zinc-400">
              Do not use the generator endpoint to probe, overload, or attempt to extract hidden model access. The site
              may rate-limit or disable generation without notice.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-white">No warranty</h2>
            <p className="mt-2 text-zinc-400">
              The site is provided as-is. Music 3.0 makes no warranty that third-party generation will be uninterrupted
              or that returned audio will match every prompt.
            </p>
          </section>
        </div>

        <Link href="/" className="mt-12 inline-block text-sm text-amber-500 hover:text-amber-400">
          Back to Music 3.0
        </Link>
      </div>
    </main>
  )
}
