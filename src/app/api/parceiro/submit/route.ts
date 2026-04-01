import { createAdminClient } from "@/lib/supabase/admin"
import { sendWhatsAppMessage, formatLeadNotification } from "@/lib/whatsapp"
import { sendLeadNotification } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { name, email, phone, company, position, advertiserId } = await request.json()

  if (!email || !advertiserId) {
    return NextResponse.json({ error: "Email and advertiserId required" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: reader, error } = await supabase
    .from("readers")
    .upsert(
      { name, email, phone, company, position, source: "parceiro" },
      { onConflict: "email" }
    )
    .select("id")
    .single()

  if (error || !reader) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  await supabase.from("tracking_events").insert({
    reader_id: reader.id,
    advertiser_id: advertiserId,
    event_type: "gate_submit",
    metadata: { company, position, source: "parceiro" },
  })

  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("contact_phone, contact_email, contact_name, company_name")
    .eq("id", advertiserId)
    .single()

  if (advertiser) {
    if (advertiser.contact_phone) {
      const msg = formatLeadNotification({
        leadName: name || "",
        leadCompany: company || "",
        leadEmail: email,
        leadPhone: phone || "",
        articleTitle: "Página Parceiro",
      })
      sendWhatsAppMessage(advertiser.contact_phone, msg).catch(() => {})
    }

    if (advertiser.contact_email) {
      sendLeadNotification({
        to: advertiser.contact_email,
        advertiserName: advertiser.contact_name || advertiser.company_name,
        leadName: name || "",
        leadCompany: company || "",
        leadEmail: email,
        leadPhone: phone || "",
        articleTitle: "Página Parceiro",
      }).catch(() => {})
    }
  }

  const response = NextResponse.json({ ok: true, readerId: reader.id })
  response.cookies.set("reader_id", reader.id, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  })

  return response
}
