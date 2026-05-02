import { fetchAndStoreArticles, RSS_SOURCES } from "@/lib/rss-engine"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

// Temporary debug endpoint to manually trigger RSS cron and verify code version
// Token is hardcoded — remove this file after diagnostic complete
const DEBUG_TOKEN = "diag-rss-2026-05-02-eduardo"

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token")
  if (token !== DEBUG_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sourcesUsed = RSS_SOURCES.map((s) => s.name)
  const startTime = Date.now()

  const result = await fetchAndStoreArticles()

  return NextResponse.json({
    ok: true,
    imported: result.imported,
    errors: result.errors,
    sourcesUsed,
    sourcesCount: sourcesUsed.length,
    durationMs: Date.now() - startTime,
    version: "v5-debug-trigger",
    timestamp: new Date().toISOString(),
  })
}
