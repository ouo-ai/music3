"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Info, Loader2, Mic2, Music2, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DEFAULT_GENERATOR_VALUES,
  STYLE_PRESETS,
  SUNO_MODELS,
  buildGenerateSearch,
  readJson,
  type GeneratorValues,
} from "@/lib/generator"

type GeneratorFormProps = {
  compact?: boolean
  redirectOnSubmit?: boolean
  initialValues?: Partial<GeneratorValues>
  onStarted?: (taskId: string, values: GeneratorValues) => void
}

export function GeneratorForm({
  compact = false,
  redirectOnSubmit = true,
  initialValues,
  onStarted,
}: GeneratorFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<GeneratorValues>({
    ...DEFAULT_GENERATOR_VALUES,
    ...initialValues,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const promptLimit = values.customMode ? (values.model === "V4" ? 3000 : 5000) : 3000
  const styleLimit = values.model === "V4" ? 200 : 1000
  const promptLabel = values.customMode
    ? values.instrumental
      ? "Optional direction"
      : "Lyrics or vocal prompt"
    : "Describe the song"
  const promptHint = useMemo(() => {
    if (!values.customMode) return "Simple mode only sends this prompt. Style, title, and extras stay empty."
    if (values.instrumental) return "Custom instrumental songs need a title and style. Lyrics are optional."
    return "Custom vocal songs need title, style, and lyrics or a vocal prompt."
  }, [values.customMode, values.instrumental])

  function update<K extends keyof GeneratorValues>(key: K, value: GeneratorValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit() {
    if (values.customMode) {
      if (!values.title.trim() || !values.style.trim()) {
        setError("Custom mode requires a title and a style.")
        return
      }
      if (!values.instrumental && !values.prompt.trim()) {
        setError("Add lyrics or a vocal prompt for a sung track.")
        return
      }
    } else if (!values.prompt.trim()) {
      setError("Add a song idea or lyrics.")
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customMode: values.customMode,
          instrumental: values.instrumental,
          prompt: values.prompt,
          title: values.title,
          style: values.style,
          model: values.model,
          negativeTags: values.customMode ? values.negativeTags : undefined,
          vocalGender: values.customMode && !values.instrumental ? values.vocalGender : undefined,
          styleWeight: values.customMode ? values.styleWeight : undefined,
          weirdnessConstraint: values.customMode ? values.weirdnessConstraint : undefined,
          audioWeight: values.customMode ? values.audioWeight : undefined,
          duration: values.customMode && values.model === "V5_5" && values.duration !== "" ? Number(values.duration) : undefined,
        }),
      })
      const data = await readJson(res)
      if (!res.ok || !data?.taskId) {
        throw new Error(data?.error || "Generation failed")
      }
      const taskId = String(data.taskId)
      onStarted?.(taskId, values)
      if (redirectOnSubmit) {
        router.push(buildGenerateSearch(taskId, values.title, values.style))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong starting generation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("w-full border border-white/15 bg-zinc-900/80 p-5 backdrop-blur-md md:p-6", compact ? "max-w-2xl" : "max-w-3xl")}>
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/50">
          <Music2 className="h-3.5 w-3.5 text-amber-500" />
          Music 3.0 Generator
        </div>
        <div className="flex items-center border border-white/10 bg-black/30 p-1 text-xs">
          <button
            type="button"
            onClick={() => update("customMode", false)}
            className={cn("px-3 py-1.5", !values.customMode ? "bg-amber-500 text-black" : "text-white/60 hover:text-white")}
          >
            Simple
          </button>
          <button
            type="button"
            onClick={() => update("customMode", true)}
            className={cn("px-3 py-1.5", values.customMode ? "bg-amber-500 text-black" : "text-white/60 hover:text-white")}
          >
            Custom
          </button>
        </div>
      </div>

      {values.customMode && (
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-left text-xs text-white/50">
            Title
            <input
              value={values.title}
              maxLength={80}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Midnight Train Home"
              className="border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
            />
          </label>
          <label className="grid gap-1 text-left text-xs text-white/50">
            Style
            <input
              value={values.style}
              maxLength={styleLimit}
              onChange={(e) => update("style", e.target.value)}
              placeholder="Cinematic pop, warm vocals"
              className="border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
            />
          </label>
        </div>
      )}

      {values.customMode && (
        <div className="mb-4 flex flex-wrap gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => update("style", preset)}
              className={cn(
                "border px-2.5 py-1 text-[11px]",
                values.style === preset ? "border-amber-500 bg-amber-500/15 text-amber-300" : "border-white/10 text-white/50 hover:text-white",
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      <label className="grid gap-1 text-left text-xs text-white/50">
        {promptLabel}
        <textarea
          value={values.prompt}
          maxLength={promptLimit}
          onChange={(e) => update("prompt", e.target.value)}
          rows={compact ? 3 : 5}
          placeholder={values.instrumental ? "A slow-burning synth ballad about leaving home" : "Verse / chorus lyrics, or describe the vocal performance"}
          className="w-full resize-none border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-500/50"
        />
        <span className="text-[11px] text-white/35">
          {promptHint} {values.prompt.length}/{promptLimit}
        </span>
      </label>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center border border-white/10 bg-black/30 p-1 text-xs">
          <button
            type="button"
            onClick={() => update("instrumental", false)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5", !values.instrumental ? "bg-amber-500 text-black" : "text-white/60 hover:text-white")}
          >
            <Mic2 className="h-3.5 w-3.5" />
            Vocal
          </button>
          <button
            type="button"
            onClick={() => update("instrumental", true)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5", values.instrumental ? "bg-amber-500 text-black" : "text-white/60 hover:text-white")}
          >
            <Music2 className="h-3.5 w-3.5" />
            Instrumental
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-white/50">
          Model
          <select
            value={values.model}
            onChange={(e) => update("model", e.target.value as GeneratorValues["model"])}
            className="border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
          >
            {SUNO_MODELS.map((model) => (
              <option key={model} value={model} className="bg-zinc-900">
                {model}
              </option>
            ))}
          </select>
        </label>
      </div>

      {values.customMode && (
        <button
          type="button"
          onClick={() => setShowAdvanced((open) => !open)}
          className="mt-4 text-left text-xs text-white/45 underline-offset-4 hover:text-white hover:underline"
        >
          {showAdvanced ? "Hide advanced Suno controls" : "Show advanced Suno controls"}
        </button>
      )}

      {values.customMode && showAdvanced && (
        <div className="mt-4 grid gap-4 border border-white/10 bg-black/20 p-4 text-left">
          <label className="grid gap-1 text-xs text-white/50">
            Negative tags
            <input
              value={values.negativeTags}
              onChange={(e) => update("negativeTags", e.target.value)}
              placeholder="Heavy Metal, Upbeat Drums"
              className="border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
            />
          </label>

          {!values.instrumental && (
            <div className="flex flex-wrap gap-2 text-xs">
              {["", "m", "f"].map((gender) => (
                <button
                  key={gender || "any"}
                  type="button"
                  onClick={() => update("vocalGender", gender as GeneratorValues["vocalGender"])}
                  className={cn(
                    "border px-3 py-1.5",
                    values.vocalGender === gender ? "border-amber-500 bg-amber-500/15 text-amber-300" : "border-white/10 text-white/50",
                  )}
                >
                  {gender === "" ? "Any vocal" : gender === "m" ? "Male vocal" : "Female vocal"}
                </button>
              ))}
            </div>
          )}

          {values.model === "V5_5" && (
            <label className="grid gap-1 text-xs text-white/50">
              Duration seconds, V5_5 only
              <input
                type="number"
                min={1}
                max={480}
                value={values.duration}
                onChange={(e) => update("duration", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Optional, e.g. 120"
                className="border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
              />
            </label>
          )}

          {(
            [
              { key: "styleWeight" as const, label: "Style weight", value: values.styleWeight },
              { key: "weirdnessConstraint" as const, label: "Weirdness", value: values.weirdnessConstraint },
              { key: "audioWeight" as const, label: "Audio weight", value: values.audioWeight },
            ] as const
          ).map((item) => (
            <label key={item.key} className="grid gap-1 text-xs text-white/50">
              {item.label}: {item.value.toFixed(2)}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={item.value}
                onChange={(e) => update(item.key, Number(e.target.value))}
                className="accent-amber-500"
              />
            </label>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-left text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting Music 3.0...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Generate with Music 3.0
          </>
        )}
      </button>

      <div className="mt-3 flex items-start gap-1.5 text-left text-[11px] leading-relaxed text-white/35">
        <Info className="mt-[1px] h-3 w-3 flex-shrink-0" />
        <span>
          Each request can return multiple Suno variations. Custom mode maps to Kie&apos;s documented title, style,
          lyrics, vocal, and V5_5 duration fields. Files are kept by the provider for 14 days.
        </span>
      </div>
    </div>
  )
}
