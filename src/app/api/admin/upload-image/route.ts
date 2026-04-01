import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  // Verify caller is admin or comercial
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["admin", "comercial"].includes(profile.role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"]
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Formato não permitido. Use JPG, PNG ou WebP." }, { status: 400 })
  }

  const path = `artigos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const admin = createAdminClient()
  const { error } = await admin.storage
    .from("revistas")
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data } = admin.storage.from("revistas").getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
