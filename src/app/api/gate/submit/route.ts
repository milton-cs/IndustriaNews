import { createAdminClient } from "@/lib/supabase/admin"
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

  const response = NextResponse.json({ ok: true, readerId: reader.id })
  response.cookies.set("reader_id", reader.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  })

  return response
}
