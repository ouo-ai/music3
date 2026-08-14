export const KIE_API_BASE = "https://api.kie.ai/api/v1"
export const KIE_REQUEST_TIMEOUT_MS = 20_000
export const KIE_MODEL = "V5_5"

export type JsonRecord = Record<string, unknown>

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

export type NormalizedTrack = {
  id: string
  title: string
  audioUrl: string
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
      imageUrl: safeHttpUrl(track.imageUrl),
      tags: cleanString(track.tags),
      duration,
    }
  })

  const status = cleanString(data.status).toUpperCase()
  const failed = /FAIL|ERROR|EXCEPTION|SENSITIVE|REJECT|CANCEL/.test(status)
  const ready = status === "SUCCESS" && tracks.some((track) => track.audioUrl)
  return {
    ok: !failed,
    state: failed ? "failed" : ready ? "ready" : "pending",
    status,
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
