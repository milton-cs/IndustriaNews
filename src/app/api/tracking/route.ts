import { createAdminClient } from "@/lib/supabase/admin"
import { parseReaderId } from "@/lib/tracking"
import { NextRequest, NextResponse } from "next/server"

const VALID_EVENTS = ["page_view", "ad_click", "ad_impression", "article_read"] as const

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event_type, article_id, campaign_id, advertiser_id, session_id, metadata } = body

  if (!event_type || !VALID_EVENTS.includes(event_type)) {
    return NextResponse.json({ error: "Invalid event_type" }, { status: 400 })
  }

  const reader_id = parseReaderId(request) || body.reader_id
  const supabase = createAdminClient()

  const { error } = await supabase.from("tracking_events").insert({
    reader_id: reader_id || null,
    session_id: session_id || null,
    event_type,
    article_id: article_id || null,
    campaign_id: campaign_id || null,
    advertiser_id: advertiser_id || null,
    metadata: metadata || {},
  })

  if (error) {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
