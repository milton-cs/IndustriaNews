import { fetchAndStoreArticles, RSS_SOURCES } from "@/lib/rss-engine"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sourcesUsed = RSS_SOURCES.map((s) => s.name)
  const startTime = new Date().toISOString()

  // Log start to a tracking events table (uses existing tracking_events with custom type)
  const supabase = createAdminClient()
  try {
    await supabase.from("tracking_events").insert({
      event_type: "cron_rss_start",
      metadata: { sources: sourcesUsed, count: sourcesUsed.length, version: "v5-instrumented", startedAt: startTime },
    })
  } catch {}

  const result = await fetchAndStoreArticles()

  try {
    await supabase.from("tracking_events").insert({
      event_type: "cron_rss_end",
      metadata: { imported: result.imported, errors: result.errors, durationMs: Date.now() - new Date(startTime).getTime() },
    })
  } catch {}

  return NextResponse.json({
    ok: true,
    imported: result.imported,
    errors: result.errors,
    sourcesUsed,
    sourcesCount: sourcesUsed.length,
    version: "v5-instrumented",
    timestamp: new Date().toISOString(),
  })
}
