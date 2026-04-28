import { RSS_SOURCES } from "@/lib/rss-engine"
import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export const dynamic = "force-dynamic"

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.substring(0, 10) || "missing"

  let aiTest: { ok: boolean; error?: string; response?: string; model?: string } = { ok: false }

  if (hasKey) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 50,
        messages: [{ role: "user", content: 'Reply with JSON: {"ok": true, "test": "industria"}' }],
      })
      const text = msg.content[0].type === "text" ? msg.content[0].text : ""
      aiTest = { ok: true, response: text, model: msg.model }
    } catch (err: any) {
      aiTest = { ok: false, error: err.message || String(err) }
    }
  }

  return NextResponse.json({
    deployedAt: new Date().toISOString(),
    rssSources: RSS_SOURCES.map((s) => s.name),
    rssCount: RSS_SOURCES.length,
    version: "diag-2026-04-28-v3-with-ai-test",
    fullContentFetch: "enabled",
    anthropic: { hasKey, keyPrefix, aiTest },
    env: {
      hasResend: !!process.env.RESEND_API_KEY,
      hasZapi: !!process.env.ZAPI_INSTANCE_ID,
      hasCronSecret: !!process.env.CRON_SECRET,
    },
  })
}
