import { NextRequest, NextResponse } from "next/server"
import {
  KIE_MODEL,
  asRecord,
  callKie,
  cleanString,
  getTaskId,
  normalizeKieResult,
  upstreamError,
} from "@/lib/kie-suno"

export const runtime = "nodejs"

const GENERATION_WINDOW_MS = 15 * 60 * 1000
const GENERATIONS_PER_WINDOW = 3
const MAX_PROMPT = 500
const MAX_STYLE = 80

type RateEntry = { count: number; resetAt: number }
const generationRate = new Map<string, RateEntry>()

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(data, { status, headers })
}

function clientAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local"
}

function consumeGenerationSlot(request: NextRequest) {
  const key = clientAddress(request)
  const now = Date.now()
  const current = generationRate.get(key)

  if (!current || current.resetAt <= now) {
    generationRate.set(key, { count: 1, resetAt: now + GENERATION_WINDOW_MS })
    return null
  }

  if (current.count >= GENERATIONS_PER_WINDOW) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  }

  current.count += 1
  return null
}

function callbackUrl(request: NextRequest) {
  const configured = process.env.KIE_CALLBACK_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
  const base = configured || request.nextUrl.origin
  return new URL("/api/generate/callback", base).toString()
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = asRecord(await request.json())
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400)
  }

  const prompt = cleanString(body.prompt)
  const style = cleanString(body.style) || "Pop"
  const mode = body.mode === "instrumental" ? "instrumental" : "vocal"
  const instrumental = mode === "instrumental"

  if (!prompt) {
    return json({ ok: false, error: "A prompt or lyric idea is required." }, 400)
  }
  if (prompt.length > MAX_PROMPT) {
    return json({ ok: false, error: "Keep prompts under 500 characters." }, 400)
  }
  if (style.length > MAX_STYLE) {
    return json({ ok: false, error: "Keep the style name under 80 characters." }, 400)
  }

  const retryAfter = consumeGenerationSlot(request)
  if (retryAfter) {
    return json(
      { ok: false, error: "This generator has reached its short-term limit. Please try again in a few minutes." },
      429,
      { "Retry-After": String(retryAfter) },
    )
  }

  const composedPrompt = `${prompt}. ${style} style.`
  if (composedPrompt.length > MAX_PROMPT) {
    return json({ ok: false, error: "Keep prompts under 500 characters." }, 400)
  }

  const payload = {
    prompt: composedPrompt,
    customMode: false,
    instrumental,
    model: KIE_MODEL,
    callBackUrl: callbackUrl(request),
  }

  const result = await callKie("/generate", { method: "POST", body: JSON.stringify(payload) })
  const code = asRecord(result.data).code
  const taskId = getTaskId(result.data)
  if (!result.ok || code !== 200 || !taskId) {
    return json(
      { ok: false, error: upstreamError(result.data, "The generation request could not be started. Please try again.") },
      result.status >= 400 ? result.status : 502,
    )
  }

  return json({
    ok: true,
    state: "pending",
    taskId,
    style,
    mode,
    disclaimer: "Generated through a Kie-hosted Suno API. Audio files come from that provider, not a first-party Music 3.0 model.",
  })
}

export async function GET(request: NextRequest) {
  const taskId = cleanString(request.nextUrl.searchParams.get("taskId"))
  if (!taskId || taskId.length > 160 || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
    return json({ ok: false, error: "A valid task ID is required." }, 400)
  }

  const result = await callKie(`/generate/record-info?taskId=${encodeURIComponent(taskId)}`, { method: "GET" })
  if (!result.ok || asRecord(result.data).code !== 200) {
    return json(
      { ok: false, error: upstreamError(result.data, "The generation status is temporarily unavailable.") },
      result.status >= 400 ? result.status : 502,
    )
  }

  return json(normalizeKieResult(result.data))
}
