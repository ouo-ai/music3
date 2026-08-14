import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Kie requires a callback URL. We poll /generate/record-info instead of
// depending on this webhook, so just acknowledge receipt.
export async function POST() {
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
