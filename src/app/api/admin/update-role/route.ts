import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem alterar funções" }, { status: 403 })
  }

  const { userId, role } = await req.json()
  if (!userId || !role) return NextResponse.json({ error: "userId e role são obrigatórios" }, { status: 400 })

  // Prevent self-demotion
  if (userId === user.id && role !== "admin") {
    return NextResponse.json({ error: "Você não pode alterar sua própria função" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
