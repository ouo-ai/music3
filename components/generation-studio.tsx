"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Loader2, Music2 } from "lucide-react"
import { GeneratorForm } from "@/components/generator-form"
import { formatDuration, readJson, type GeneratedTrack } from "@/lib/generator"

export function GenerationStudio() {
  const searchParams = useSearchParams()
  const urlTaskId = searchParams.get("taskId") || ""
  const [localTaskId, setLocalTaskId] = useState("")
  const taskId = urlTaskId || localTaskId
  const [status, setStatus] = useState("")
  const [state, setState] = useState("idle")
  const [tracks, setTracks] = useState<GeneratedTrack[]>([])
  const [error, setError] = useState<string | null>(null)

  const headline = useMemo(() => {
    if (state === "ready") return "Your Music 3.0 variations are ready"
    if (state === "failed") return "Generation did not finish"
    if (state === "pending") return "Composing your Music 3.0 tracks"
    return "Start a Music 3.0 generation"
  }, [state])

  useEffect(() => {
    if (!taskId) return
    let cancelled = false
    const deadline = Date.now() + 240_000

    async function poll() {
      while (!cancelled && Date.now() < deadline) {
        const res = await fetch(`/api/generate?taskId=${encodeURIComponent(taskId)}`)
        const data = await readJson(res)
        if (cancelled) return
        if (!res.ok) {
          setError(data?.error || "Could not check generation status.")
          setState("failed")
          return
        }
        setStatus(data.status || "PENDING")
        if (Array.isArray(data.tracks) && data.tracks.length > 0) {
          setTracks(data.tracks.filter((track: GeneratedTrack) => track.audioUrl))
        }
        if (data.state === "failed") {
          setError(data.error || "Generation did not complete. Try a different prompt.")
          setState("failed")
          return
        }
        if (data.state === "ready") {
          setState("ready")
          return
        }
        setState("pending")
        await new Promise((resolve) => setTimeout(resolve, 4000))
      }
      if (!cancelled) {
        setError("Generation is taking longer than expected. Refresh this page or start again.")
        setState("failed")
      }
    }

    poll().catch(() => {
      if (!cancelled) {
        setError("Could not check generation status.")
        setState("failed")
      }
    })

    return () => {
      cancelled = true
    }
  }, [taskId])

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:px-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-16">
      <div>
        <div className="mb-6 flex items-center gap-3 border border-zinc-700 px-4 py-2 w-fit">
          <div className="h-2.5 w-2.5 bg-amber-500" />
          <span className="text-sm font-medium tracking-wide text-zinc-400">Generate</span>
        </div>
        <h1 className="max-w-xl text-4xl font-normal tracking-tight text-white md:text-5xl">{headline}</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
          Music 3.0 uses Kie&apos;s documented Suno generate endpoint. Custom mode sends title, style, lyrics,
          vocal gender, negative tags, and optional V5_5 duration. Each request can return multiple audio variations.
        </p>
        {taskId && (
          <p className="mt-3 text-xs text-white/35">
            Task {taskId} · {status || state}
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-8 space-y-4">
          {state === "pending" && tracks.length === 0 && (
            <div className="flex items-center gap-3 border border-white/10 bg-black/20 p-5 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Waiting for the first Suno variation. Callbacks move through text, first track, then complete.
            </div>
          )}
          {tracks.map((track) => (
            <article key={track.id} className="border border-amber-500/20 bg-zinc-950/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {track.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={track.imageUrl} alt="" className="h-14 w-14 object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center bg-amber-500/10 text-amber-400">
                      <Music2 className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-base text-white">{track.title}</h2>
                    <p className="text-xs text-white/45">
                      {track.tags || "Suno variation"} · {formatDuration(track.duration)}
                    </p>
                  </div>
                </div>
                <a
                  href={track.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white"
                  aria-label={`Download ${track.title}`}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
              <audio className="mt-4 w-full" controls src={track.streamAudioUrl || track.audioUrl} preload="none" />
            </article>
          ))}
        </div>
      </div>

      <div>
        <GeneratorForm
          compact={false}
          redirectOnSubmit
          onStarted={(nextTaskId) => {
            setLocalTaskId(nextTaskId)
            setTracks([])
            setError(null)
            setState("pending")
            setStatus("PENDING")
          }}
        />
      </div>
    </div>
  )
}
