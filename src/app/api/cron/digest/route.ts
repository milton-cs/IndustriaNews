import { createAdminClient } from "@/lib/supabase/admin"
import { sendDailyDigest } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: advertisers } = await supabase
    .from("advertisers")
    .select("id, company_name, contact_email, contact_name")
    .eq("status", "ativo")
    .not("contact_email", "is", null)

  if (!advertisers?.length) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const period = `${new Date(sevenDaysAgo).toLocaleDateString("pt-BR")} – ${now.toLocaleDateString("pt-BR")}`

  let sent = 0
  let errors = 0

  for (const advertiser of advertisers) {
    try {
      const [leadsRes, clicksRes] = await Promise.all([
        supabase
          .from("tracking_events")
          .select("id", { count: "exact", head: true })
          .eq("advertiser_id", advertiser.id)
          .eq("event_type", "gate_submit")
          .gte("created_at", sevenDaysAgo),
        supabase
          .from("tracking_events")
          .select("id", { count: "exact", head: true })
          .eq("advertiser_id", advertiser.id)
          .eq("event_type", "ad_click")
          .gte("created_at", sevenDaysAgo),
      ])

      const leadsCount = leadsRes.count || 0
      const clicksCount = clicksRes.count || 0

      if (leadsCount > 0 || clicksCount > 0) {
        await sendDailyDigest({
          to: advertiser.contact_email,
          advertiserName: advertiser.contact_name || advertiser.company_name,
          leadsCount,
          clicksCount,
          period,
        })
        sent++
      }
    } catch {
      errors++
    }
  }

  return NextResponse.json({ ok: true, sent, errors, timestamp: new Date().toISOString() })
}
