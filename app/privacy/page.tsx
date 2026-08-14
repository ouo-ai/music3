import type { Metadata } from "next"
import Link from "next/link"
import { Music2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How the Music 3.0 landing page handles data, including the demo generator and Vercel Analytics.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-12 md:py-24">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <Music2 className="h-4 w-4 text-amber-500" />
          Music 3.0
        </Link>
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Privacy</p>
        <h1 className="mt-3 text-4xl font-normal tracking-tight md:text-5xl">How this site handles data</h1>
        <p className="mt-4 text-sm text-zinc-500">Last updated August 14, 2026.</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-300">
          <p>
            This is the Music 3.0 landing page at music3.ai. It is an independent product site with a first-screen
            demo generator. It is not a live official audio-model backend.
          </p>
          <section>
            <h2 className="text-xl text-white">No accounts</h2>
            <p className="mt-2 text-zinc-400">
              There is no sign-up, login, billing form, or user account system on this site.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-white">Demo generator</h2>
            <p className="mt-2 text-zinc-400">
              The Music 3.0 generator posts prompt, style, and vocal/instrumental choices to a local demo API route.
              That route returns a mock track preview and does not store prompts, create audio files, or call a live
              production music model.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-white">Analytics</h2>
            <p className="mt-2 text-zinc-400">
              The site uses Vercel Analytics for aggregated traffic. It does not load advertising pixels or a
              separate marketing tag manager.
            </p>
          </section>
          <section>
            <h2 className="text-xl text-white">No customer database</h2>
            <p className="mt-2 text-zinc-400">
              This landing page does not operate a customer database and does not persist visitor prompts server-side.
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
