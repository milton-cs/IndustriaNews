import { createAdminClient } from "@/lib/supabase/admin"
import { sendWhatsAppMessage, formatLeadNotification } from "@/lib/whatsapp"
import { sendLeadNotification } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { name, email, phone, company, position, articleId } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: reader, error } = await supabase
    .from("readers")
    .upsert(
      { name, email, phone, company, position, source: "gate" },
      { onConflict: "email" }
    )
    .select("id")
    .single()

  if (error || !reader) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  await supabase.from("tracking_events").insert({
    reader_id: reader.id,
    event_type: "gate_submit",
    article_id: articleId || null,
    metadata: { company, position },
  })

  // Get article title for notification
  let articleTitle = ""
  if (articleId) {
    const { data: article } = await supabase.from("articles").select("title").eq("id", articleId).single()
    if (article) articleTitle = article.title
  }

  // Notify active advertisers (Plano Ouro) via WhatsApp + Email
  const { data: advertisers } = await supabase
    .from("advertisers")
    .select("contact_phone, contact_email, contact_name, company_name, plan")
    .eq("status", "active")
    .eq("plan", "ouro")

  if (advertisers && advertisers.length > 0) {
    for (const adv of advertisers) {
      // WhatsApp notification
      if (adv.contact_phone) {
        const msg = formatLeadNotification({
          leadName: name || "",
          leadCompany: company || "",
          leadEmail: email,
          leadPhone: phone || "",
          articleTitle,
        })
        sendWhatsAppMessage(adv.contact_phone, msg).catch(() => {})
      }

      // Email notification
      if (adv.contact_email) {
        sendLeadNotification({
          to: adv.contact_email,
          advertiserName: adv.contact_name || adv.company_name,
          leadName: name || "",
          leadCompany: company || "",
          leadEmail: email,
          leadPhone: phone || "",
          articleTitle,
        }).catch(() => {})
      }
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
