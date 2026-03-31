import { createAdminClient } from "@/lib/supabase/admin"
import { generateReportHtml } from "@/lib/pdf-report"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const advertiserId = new URL(request.url).searchParams.get("advertiser_id")
  if (!advertiserId) return NextResponse.json({ error: "advertiser_id required" }, { status: 400 })

  const supabase = createAdminClient()
  const { data: advertiser } = await supabase.from("advertisers").select("company_name, plan").eq("id", advertiserId).single()
  if (!advertiser) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
  const period = new Date(now.getFullYear(), now.getMonth() - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const [impRes, clickRes, leadsRes] = await Promise.all([
    supabase.from("tracking_events").select("id", { count: "exact", head: true }).eq("advertiser_id", advertiserId).eq("event_type", "ad_impression").gte("created_at", start).lte("created_at", end),
    supabase.from("tracking_events").select("id", { count: "exact", head: true }).eq("advertiser_id", advertiserId).eq("event_type", "ad_click").gte("created_at", start).lte("created_at", end),
    supabase.from("tracking_events").select("readers(name, email, company, position, phone)").eq("advertiser_id", advertiserId).eq("event_type", "ad_click").not("reader_id", "is", null).gte("created_at", start).lte("created_at", end),
  ])

  const impressions = impRes.count || 0
  const clicks = clickRes.count || 0
  const ctr = impressions ? ((clicks / impressions) * 100).toFixed(1) + "%" : "0%"
  const seen = new Set<string>()
  const leadsList = (leadsRes.data || []).map((e: any) => Array.isArray(e.readers) ? e.readers[0] : e.readers).filter((r: any) => { if (!r || seen.has(r.email)) return false; seen.add(r.email); return true })

  return new NextResponse(generateReportHtml({ advertiserName: advertiser.company_name, period, impressions, clicks, leads: leadsList.length, ctr, leadsList }), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}

export async function POST(request: NextRequest) {
  const { advertiser_id } = await request.json()
  if (!advertiser_id) return NextResponse.json({ error: "advertiser_id required" }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.from("reports").insert({ advertiser_id, period_start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(), period_end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString(), status: "ready" }).select("id").single()

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 })
  return NextResponse.json({ ok: true, report_id: data.id, url: `/api/reports/generate?advertiser_id=${advertiser_id}` })
}
