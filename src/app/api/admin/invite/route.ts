import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem convidar usuários" }, { status: 403 })
  }

  const { email, role } = await req.json()
  if (!email || !role) return NextResponse.json({ error: "E-mail e função são obrigatórios" }, { status: 400 })
  if (!["admin", "comercial"].includes(role)) {
    return NextResponse.json({ error: "Função inválida" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Invite user by email
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://industrianews.com"}/admin`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Set role in profiles (upsert in case profile already exists)
  if (data.user) {
    await admin.from("profiles").upsert({
      id: data.user.id,
      role,
      full_name: "",
    }, { onConflict: "id" })
  }

  return NextResponse.json({ ok: true })
}
