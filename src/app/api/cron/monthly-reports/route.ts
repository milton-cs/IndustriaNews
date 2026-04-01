import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: advertisers } = await supabase
    .from("advertisers")
    .select("id, company_name")
    .eq("status", "ativo")

  if (!advertisers?.length) {
    return NextResponse.json({ ok: true, generated: 0 })
  }

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  let generated = 0
  let skipped = 0
  let errors = 0

  for (const advertiser of advertisers) {
    try {
      const { data: existing } = await supabase
        .from("reports")
        .select("id")
        .eq("advertiser_id", advertiser.id)
        .gte("period_start", periodStart)
        .lt("period_start", new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      await supabase.from("reports").insert({
        advertiser_id: advertiser.id,
        period_start: periodStart,
        period_end: periodEnd,
        status: "ready",
        pdf_url: `/api/reports/generate?advertiser_id=${advertiser.id}`,
      })

      generated++
    } catch {
      errors++
    }
  }

  return NextResponse.json({ ok: true, generated, skipped, errors, timestamp: new Date().toISOString() })
}
