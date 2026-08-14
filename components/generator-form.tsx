"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wand2, Mic2, Music2, Loader2, Download, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const STYLES = [
  "Pop",
  "Lo-fi",
  "Cinematic",
  "Hip-Hop",
  "Electronic",
  "Acoustic",
  "Rock",
  "Ambient",
]

interface GeneratedTrack {
  title: string
  style: string
  mode: "vocal" | "instrumental"
  duration: string
  bars: number[]
}

export function GeneratorForm() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState(STYLES[0])
  const [mode, setMode] = useState<"vocal" | "instrumental">("vocal")
  const [loading, setLoading] = useState(false)
  const [track, setTrack] = useState<GeneratedTrack | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Add a lyric idea or a short description to generate a song.")
      return
    }
    setError(null)
    setLoading(true)
    setTrack(null)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Generation failed")
      setTrack(data.track)
    } catch {
      setError("Something went wrong generating your demo track. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl border border-white/15 bg-zinc-900/70 p-5 backdrop-blur-md md:p-6">
      <div className="flex items-center gap-2 pb-4 text-left text-xs font-medium uppercase tracking-wide text-white/50">
        <Music2 className="h-3.5 w-3.5 text-amber-500" />
        Music 3.0 Generator — Demo
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your song or paste lyrics — e.g. &quot;a slow-burning synth ballad about leaving home&quot;"
        rows={3}
        className="w-full resize-none border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-500/50"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="style-select" className="text-xs text-white/50">
            Style
          </label>
          <select
            id="style-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
          >
            {STYLES.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center border border-white/10 bg-black/30 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("vocal")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
              mode === "vocal" ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"
            )}
          >
            <Mic2 className="h-3.5 w-3.5" />
            Vocal
          </button>
          <button
            type="button"
            onClick={() => setMode("instrumental")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
              mode === "instrumental" ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"
            )}
          >
            <Music2 className="h-3.5 w-3.5" />
            Instrumental
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Composing your track...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Generate with Music 3.0
          </>
        )}
      </button>

      <AnimatePresence>
        {track && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{track.title}</p>
                  <p className="text-xs text-white/50">
                    {track.style} · {track.mode === "vocal" ? "Vocal" : "Instrumental"} · {track.duration}
                  </p>
                </div>
                <Download className="h-4 w-4 text-white/40" />
              </div>
              <div className="mt-3 flex h-10 items-end gap-[3px]">
                {track.bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-amber-500/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-white/35">
        <Info className="mt-[1px] h-3 w-3 flex-shrink-0" />
        <span>
          This is a demo preview generator. It does not connect to a live production audio model — no real
          audio file is rendered.
        </span>
      </div>
    </div>
  )
}
