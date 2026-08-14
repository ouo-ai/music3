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
  id: string
  title: string
  audioUrl: string
  imageUrl?: string
  tags?: string
  duration: number | null
  style: string
  mode: "vocal" | "instrumental"
}

function formatDuration(seconds: number | null) {
  if (!seconds || !Number.isFinite(seconds)) return "Ready"
  const mins = Math.floor(seconds / 60)
  const secs = String(Math.round(seconds % 60)).padStart(2, "0")
  return `${mins}:${secs}`
}

async function readJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

export function GeneratorForm() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState(STYLES[0])
  const [mode, setMode] = useState<"vocal" | "instrumental">("vocal")
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [tracks, setTracks] = useState<GeneratedTrack[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Add a lyric idea or a short description to generate a song.")
      return
    }
    setError(null)
    setLoading(true)
    setTracks([])
    setStatusText("Sending your idea to Music 3.0...")
    try {
      const startRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, mode }),
      })
      const startData = await readJson(startRes)
      if (!startRes.ok || !startData?.taskId) {
        throw new Error(startData?.error || "Generation failed")
      }

      const taskId = String(startData.taskId)
      const deadline = Date.now() + 180_000
      while (Date.now() < deadline) {
        setStatusText("Composing your track...")
        await new Promise((resolve) => setTimeout(resolve, 4000))
        const pollRes = await fetch(`/api/generate?taskId=${encodeURIComponent(taskId)}`)
        const pollData = await readJson(pollRes)
        if (!pollRes.ok) {
          throw new Error(pollData?.error || "Could not check generation status.")
        }
        if (pollData.state === "failed") {
          throw new Error(pollData.error || "Generation did not complete. Try a different prompt.")
        }
        if (pollData.state === "ready" && Array.isArray(pollData.tracks) && pollData.tracks.length > 0) {
          setTracks(
            pollData.tracks
              .filter((track: { audioUrl?: string }) => track?.audioUrl)
              .map((track: { id?: string; title?: string; audioUrl: string; imageUrl?: string; tags?: string; duration?: number | null }) => ({
                id: track.id || track.audioUrl,
                title: track.title || "Untitled Idea",
                audioUrl: track.audioUrl,
                imageUrl: track.imageUrl,
                tags: track.tags,
                duration: typeof track.duration === "number" ? track.duration : null,
                style,
                mode,
              })),
          )
          setStatusText("")
          return
        }
      }
      throw new Error("Generation is taking longer than expected. Please try again.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong generating your track. Try again.")
    } finally {
      setLoading(false)
      setStatusText("")
    }
  }

  return (
    <div className="w-full max-w-2xl border border-white/15 bg-zinc-900/70 p-5 backdrop-blur-md md:p-6">
      <div className="flex items-center gap-2 pb-4 text-left text-xs font-medium uppercase tracking-wide text-white/50">
        <Music2 className="h-3.5 w-3.5 text-amber-500" />
        Music 3.0 Generator
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='Describe your song or paste lyrics — e.g. "a slow-burning synth ballad about leaving home"'
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
            {statusText || "Composing your track..."}
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Generate with Music 3.0
          </>
        )}
      </button>

      <AnimatePresence>
        {tracks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="space-y-3">
              {tracks.map((track) => (
                <div key={track.id} className="border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{track.title}</p>
                      <p className="text-xs text-white/50">
                        {track.style} · {track.mode === "vocal" ? "Vocal" : "Instrumental"} · {formatDuration(track.duration)}
                      </p>
                    </div>
                    <a
                      href={track.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 transition-colors hover:text-white"
                      aria-label={`Download ${track.title}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                  <audio className="mt-3 w-full" controls src={track.audioUrl} preload="none" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-white/35">
        <Info className="mt-[1px] h-3 w-3 flex-shrink-0" />
        <span>
          This public generator creates real audio through a Kie-hosted Suno API. It is not a first-party Music 3.0
          model, and generations may be rate-limited.
        </span>
      </div>
    </div>
  )
}
