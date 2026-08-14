import { NextRequest, NextResponse } from "next/server"
import {
  DEFAULT_MODEL,
  asRecord,
  buildGeneratePayload,
  callKie,
  cleanString,
  getTaskId,
  isSunoModel,
  normalizeKieResult,
  parseOptionalNumber,
  upstreamError,
  validateGenerateInput,
  type GenerateInput,
  type SunoModel,
  type VocalGender,
} from "@/lib/kie-suno"

export const runtime = "nodejs"

const GENERATION_WINDOW_MS = 15 * 60 * 1000
const GENERATIONS_PER_WINDOW = 3

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

  const requestedModel = cleanString(body.model)
  const model: SunoModel = isSunoModel(requestedModel) ? requestedModel : DEFAULT_MODEL
  const customMode = body.customMode === true || body.mode === "custom"
  const instrumental = body.instrumental === true || body.mode === "instrumental"
  const vocalGenderRaw = cleanString(body.vocalGender)
  const vocalGender: VocalGender | "" = vocalGenderRaw === "m" || vocalGenderRaw === "f" ? vocalGenderRaw : ""
  const styleWeight = parseOptionalNumber(body.styleWeight, 0, 1)
  const weirdnessConstraint = parseOptionalNumber(body.weirdnessConstraint, 0, 1)
  const audioWeight = parseOptionalNumber(body.audioWeight, 0, 1)
  const duration = parseOptionalNumber(body.duration, 1, 480)

  if (styleWeight === null || weirdnessConstraint === null || audioWeight === null) {
    return json({ ok: false, error: "Style, weirdness, and audio weights must be numbers between 0 and 1." }, 400)
  }
  if (duration === null) {
    return json({ ok: false, error: "Duration must be a number of seconds between 1 and 480." }, 400)
  }

  const input: GenerateInput = {
    customMode,
    instrumental,
    prompt: cleanString(body.prompt),
    style: cleanString(body.style),
    title: cleanString(body.title),
    model,
    negativeTags: cleanString(body.negativeTags) || undefined,
    vocalGender,
    styleWeight,
    weirdnessConstraint,
    audioWeight,
    duration,
    personaId: cleanString(body.personaId) || undefined,
    personaModel: cleanString(body.personaModel) || undefined,
    callBackUrl: callbackUrl(request),
  }

  const validationError = validateGenerateInput(input)
  if (validationError) {
    return json({ ok: false, error: validationError }, 400)
  }

  const retryAfter = consumeGenerationSlot(request)
  if (retryAfter) {
    return json(
      { ok: false, error: "This generator has reached its short-term limit. Please try again in a few minutes." },
      429,
      { "Retry-After": String(retryAfter) },
    )
  }

  const payload = buildGeneratePayload(input)
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
    model,
    customMode,
    instrumental,
    title: input.title || undefined,
    style: input.style || undefined,
    disclaimer:
      "Generated through a Kie-hosted Suno API. Audio files come from that provider, not a first-party Music 3.0 model.",
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
