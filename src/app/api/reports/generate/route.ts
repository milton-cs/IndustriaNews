import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { advertiser_id, period_start, period_end } = await request.json()

  if (!advertiser_id) {
    return NextResponse.json({ error: "advertiser_id required" }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Get advertiser info
  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("company_name, plan, sector")
    .eq("id", advertiser_id)
    .single()

  if (!advertiser) {
    return NextResponse.json({ error: "Advertiser not found" }, { status: 404 })
  }

  const start = period_start || new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()
  const end = period_end || new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString()

  // Gather metrics
  const [impressionsRes, clicksRes, leadsRes] = await Promise.all([
    supabase.from("tracking_events").select("id", { count: "exact", head: true })
      .eq("advertiser_id", advertiser_id).eq("event_type", "ad_impression")
      .gte("created_at", start).lte("created_at", end),
    supabase.from("tracking_events").select("id", { count: "exact", head: true })
      .eq("advertiser_id", advertiser_id).eq("event_type", "ad_click")
      .gte("created_at", start).lte("created_at", end),
    supabase.from("tracking_events")
      .select("reader_id, readers(name, email, company, position, phone)")
      .eq("advertiser_id", advertiser_id).eq("event_type", "ad_click")
      .not("reader_id", "is", null)
      .gte("created_at", start).lte("created_at", end),
  ])

  // Create report record
  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      advertiser_id,
      period_start: start,
      period_end: end,
      status: "ready",
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    report_id: report.id,
    summary: {
      advertiser: advertiser.company_name,
      plan: advertiser.plan,
      period: { start, end },
      impressions: impressionsRes.count || 0,
      clicks: clicksRes.count || 0,
      leads: leadsRes.data?.length || 0,
      ctr: impressionsRes.count
        ? (((clicksRes.count || 0) / impressionsRes.count) * 100).toFixed(1) + "%"
        : "0%",
    },
  })
}
