import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// LEGACY DETECTOR — captures ghost crons hitting the old path from stale deployments.
// The real RSS cron is now /api/cron/rss-v8. If something hits THIS endpoint, log it.
export async function GET(request: NextRequest) {
  const headers: Record<string, string> = {}
  request.headers.forEach((v, k) => { headers[k] = v })

  const supabase = createAdminClient()
  try {
    await supabase.from("tracking_events").insert({
      event_type: "cron_legacy_hit",
      metadata: {
        path: "/api/cron/rss",
        timestamp: new Date().toISOString(),
        headers: {
          "user-agent": headers["user-agent"] || null,
          "x-vercel-id": headers["x-vercel-id"] || null,
          "x-forwarded-for": headers["x-forwarded-for"] || null,
          "x-vercel-deployment-url": headers["x-vercel-deployment-url"] || null,
          "x-vercel-cron": headers["x-vercel-cron"] || null,
          host: headers["host"] || null,
        },
      },
    })
  } catch {}

  return NextResponse.json(
    {
      error: "Gone",
      message: "This endpoint has been moved to /api/cron/rss-v8. Old cron paths are being phased out.",
      legacyAccessLogged: true,
    },
    { status: 410 }
  )
}
