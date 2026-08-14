export const SUNO_MODELS = ["V5_5", "V5", "V4_5PLUS", "V4_5ALL", "V4_5", "V4"] as const
export type SunoModel = (typeof SUNO_MODELS)[number]

export const STYLE_PRESETS = [
  "Pop",
  "Lo-fi",
  "Cinematic",
  "Hip-Hop",
  "Electronic",
  "Acoustic",
  "Rock",
  "Ambient",
  "R&B",
  "Jazz",
  "Folk",
  "Classical",
]

export type GeneratorValues = {
  customMode: boolean
  instrumental: boolean
  prompt: string
  title: string
  style: string
  model: SunoModel
  negativeTags: string
  vocalGender: "" | "m" | "f"
  styleWeight: number
  weirdnessConstraint: number
  audioWeight: number
  duration: number | ""
}

export const DEFAULT_GENERATOR_VALUES: GeneratorValues = {
  customMode: true,
  instrumental: false,
  prompt: "",
  title: "",
  style: "Pop",
  model: "V5_5",
  negativeTags: "",
  vocalGender: "",
  styleWeight: 0.65,
  weirdnessConstraint: 0.65,
  audioWeight: 0.65,
  duration: "",
}

export type GeneratedTrack = {
  id: string
  title: string
  audioUrl: string
  streamAudioUrl?: string
  imageUrl?: string
  tags?: string
  duration: number | null
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds || !Number.isFinite(seconds)) return "Ready"
  const mins = Math.floor(seconds / 60)
  const secs = String(Math.round(seconds % 60)).padStart(2, "0")
  return `${mins}:${secs}`
}

export async function readJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

export function buildGenerateSearch(taskId: string, title?: string, style?: string) {
  const params = new URLSearchParams({ taskId })
  if (title) params.set("title", title)
  if (style) params.set("style", style)
  return `/generate?${params.toString()}`
}
