import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("advertiser_id, role")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "No profile" }, { status: 403 })
  }

  let query = supabase
    .from("readers")
    .select("name, email, phone, company, position, source, lead_score, created_at")
    .order("created_at", { ascending: false })

  // If advertiser, filter to only their leads via tracking_events
  if (profile.role === "anunciante" && profile.advertiser_id) {
    const { data: events } = await supabase
      .from("tracking_events")
      .select("reader_id")
      .eq("advertiser_id", profile.advertiser_id)
      .not("reader_id", "is", null)

    const readerIds = [...new Set((events || []).map((e: any) => e.reader_id))]
    if (readerIds.length > 0) {
      query = query.in("id", readerIds)
    } else {
      // No leads
      const csv = "Nome,Email,Telefone,Empresa,Cargo,Origem,Score,Data\n"
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=leads-industria-news.csv",
        },
      })
    }
  }

  const { data: readers } = await query

  const header = "Nome,Email,Telefone,Empresa,Cargo,Origem,Score,Data"
  const rows = (readers || []).map((r: any) =>
    [
      r.name || "",
      r.email || "",
      r.phone || "",
      r.company || "",
      r.position || "",
      r.source || "",
      r.lead_score || 0,
      r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  )

  const csv = [header, ...rows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=leads-industria-news-${new Date().toISOString().slice(0, 10)}.csv`,
    },
  })
}
