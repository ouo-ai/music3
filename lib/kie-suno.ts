export const KIE_API_BASE = "https://api.kie.ai/api/v1"
export const KIE_REQUEST_TIMEOUT_MS = 20_000

export const SUNO_MODELS = ["V5_5", "V5", "V4_5PLUS", "V4_5ALL", "V4_5", "V4"] as const
export type SunoModel = (typeof SUNO_MODELS)[number]

export const MODEL_LIMITS: Record<SunoModel, { prompt: number; style: number; simplePrompt: number }> = {
  V5_5: { prompt: 5000, style: 1000, simplePrompt: 3000 },
  V5: { prompt: 5000, style: 1000, simplePrompt: 3000 },
  V4_5PLUS: { prompt: 5000, style: 1000, simplePrompt: 3000 },
  V4_5ALL: { prompt: 5000, style: 1000, simplePrompt: 3000 },
  V4_5: { prompt: 5000, style: 1000, simplePrompt: 3000 },
  V4: { prompt: 3000, style: 200, simplePrompt: 3000 },
}

export const TITLE_LIMIT = 80
export const DEFAULT_MODEL: SunoModel = "V5_5"

export type JsonRecord = Record<string, unknown>
export type VocalGender = "m" | "f"

export type GenerateInput = {
  customMode: boolean
  instrumental: boolean
  prompt: string
  style: string
  title: string
  model: SunoModel
  negativeTags?: string
  vocalGender?: VocalGender | ""
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  duration?: number
  personaId?: string
  personaModel?: string
  callBackUrl: string
}

export function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {}
}

export function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function safeHttpUrl(value: unknown) {
  const text = cleanString(value)
  if (!text) return ""
  try {
    const url = new URL(text)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : ""
  } catch {
    return ""
  }
}

export function isSunoModel(value: string): value is SunoModel {
  return (SUNO_MODELS as readonly string[]).includes(value)
}

export function parseOptionalNumber(value: unknown, min: number, max: number) {
  if (value === undefined || value === null || value === "") return undefined
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(number)) return null
  if (number < min || number > max) return null
  return number
}

export function getTaskId(value: unknown, depth = 0): string | null {
  if (!value || depth > 4) return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const taskId = getTaskId(item, depth + 1)
      if (taskId) return taskId
    }
    return null
  }
  if (typeof value !== "object") return null

  for (const [key, item] of Object.entries(value)) {
    if ((key === "taskId" || key === "task_id") && typeof item === "string" && item.trim()) {
      return item.trim()
    }
  }
  for (const item of Object.values(value)) {
    const taskId = getTaskId(item, depth + 1)
    if (taskId) return taskId
  }
  return null
}

export function upstreamError(value: unknown, fallback: string) {
  const root = asRecord(value)
  const data = asRecord(root.data)
  const candidates = [data.errorMessage, data.message, root.error, root.message, root.msg]
  const message = candidates.find((item) => typeof item === "string" && item.trim() && !/^success$/i.test(item.trim()))
  return typeof message === "string" ? message.trim() : fallback
}

export function validateGenerateInput(input: GenerateInput) {
  const limits = MODEL_LIMITS[input.model]

  if (input.customMode) {
    if (!input.title) return "Custom mode requires a title."
    if (input.title.length > TITLE_LIMIT) return `Keep titles under ${TITLE_LIMIT} characters.`
    if (!input.style) return "Custom mode requires a style."
    if (input.style.length > limits.style) return `Keep style under ${limits.style} characters for ${input.model}.`
    if (!input.instrumental && !input.prompt) return "Vocal custom songs need lyrics or a prompt."
    if (input.prompt.length > limits.prompt) return `Keep lyrics/prompt under ${limits.prompt} characters for ${input.model}.`
    if (input.duration !== undefined && input.model !== "V5_5") {
      return "Duration is only supported on V5_5."
    }
  } else if (!input.prompt) {
    return "Add a song idea or lyrics."
  } else if (input.prompt.length > limits.simplePrompt) {
    return `Keep simple prompts under ${limits.simplePrompt} characters.`
  }

  return null
}

export function buildGeneratePayload(input: GenerateInput) {
  const payload: JsonRecord = {
    customMode: input.customMode,
    instrumental: input.instrumental,
    model: input.model,
    callBackUrl: input.callBackUrl,
  }

  if (!input.customMode) {
    payload.prompt = input.prompt
    return payload
  }

  payload.title = input.title
  payload.style = input.style
  if (!input.instrumental || input.prompt) payload.prompt = input.prompt
  if (input.negativeTags) payload.negativeTags = input.negativeTags
  if (input.vocalGender === "m" || input.vocalGender === "f") payload.vocalGender = input.vocalGender
  if (input.styleWeight !== undefined) payload.styleWeight = input.styleWeight
  if (input.weirdnessConstraint !== undefined) payload.weirdnessConstraint = input.weirdnessConstraint
  if (input.audioWeight !== undefined) payload.audioWeight = input.audioWeight
  if (input.model === "V5_5" && input.duration !== undefined) payload.duration = input.duration
  if (input.personaId) payload.personaId = input.personaId
  if (input.personaId && input.personaModel) payload.personaModel = input.personaModel
  return payload
}

export type NormalizedTrack = {
  id: string
  title: string
  audioUrl: string
  streamAudioUrl: string
  imageUrl: string
  tags: string
  duration: number | null
}

export function normalizeKieResult(value: unknown) {
  const root = asRecord(value)
  const data = asRecord(root.data)
  const response = asRecord(data.response)
  const rows = Array.isArray(response.sunoData) ? response.sunoData : []
  const tracks: NormalizedTrack[] = rows.slice(0, 4).map((item, index) => {
    const track = asRecord(item)
    const duration = typeof track.duration === "number" && Number.isFinite(track.duration) ? track.duration : null
    return {
      id: cleanString(track.id) || String(index),
      title: cleanString(track.title) || `Generated track ${index + 1}`,
      audioUrl: safeHttpUrl(track.audioUrl) || safeHttpUrl(track.streamAudioUrl),
      streamAudioUrl: safeHttpUrl(track.streamAudioUrl),
      imageUrl: safeHttpUrl(track.imageUrl),
      tags: cleanString(track.tags),
      duration,
    }
  })

  const status = cleanString(data.status).toUpperCase()
  const failed = /FAIL|ERROR|EXCEPTION|SENSITIVE|REJECT|CANCEL/.test(status)
  const ready = (status === "SUCCESS" || status === "COMPLETE" || status === "FIRST") && tracks.some((track) => track.audioUrl)
  return {
    ok: !failed,
    state: failed ? "failed" : ready ? "ready" : "pending",
    status: status || "PENDING",
    taskId: getTaskId(value),
    tracks,
    error: failed ? upstreamError(value, "Music generation did not complete. Try a different prompt.") : undefined,
  } as const
}

export async function callKie(path: string, init: RequestInit = {}) {
  const apiKey = process.env.KIE_AI_API_KEY || process.env.KIE_API_KEY
  if (!apiKey) {
    return { ok: false, status: 503, data: { error: "Music generation is not configured yet." } }
  }

  try {
    const response = await fetch(`${KIE_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(KIE_REQUEST_TIMEOUT_MS),
    })
    const text = await response.text()
    let data: unknown = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = { error: "The music service returned an unexpected response." }
    }
    return { ok: response.ok, status: response.status, data }
  } catch (error) {
    return {
      ok: false,
      status: 504,
      data: {
        error:
          error instanceof Error && error.name === "TimeoutError"
            ? "The music service took too long to respond. Please try again."
            : "The music service could not be reached. Please try again.",
      },
    }
  }
}
