"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type Member = {
  id: string
  full_name: string
  role: string
  email?: string
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  comercial: "Comercial",
  anunciante: "Anunciante",
}

const roleColors: Record<string, string> = {
  admin: "text-brand-lavanda bg-brand-lavanda/10",
  comercial: "text-green-400 bg-green-400/10",
  anunciante: "text-amber-400 bg-amber-400/10",
}

export default function EquipeAdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("comercial")
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Role change
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const supabase = createClient()

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["admin", "comercial"])
      .order("role")

    // Fetch emails via API (only available server-side, so we skip them here)
    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteMsg(null)
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteMsg({ type: "err", text: data.error || "Erro ao convidar" })
      } else {
        setInviteMsg({ type: "ok", text: `Convite enviado para ${inviteEmail}` })
        setInviteEmail("")
        load()
      }
    } catch {
      setInviteMsg({ type: "err", text: "Erro de conexão" })
    }
    setInviting(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    await fetch("/api/admin/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    })
    await load()
    setUpdatingId(null)
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>

  return (
    <div className="max-w-3xl">
      <h1 className="font-headline text-2xl font-black mb-2">EQUIPE</h1>
      <p className="text-sm text-gray-400 mb-8">Gerencie administradores e usuários comerciais do painel.</p>

      {/* Invite form */}
      <div className="bg-brand-grafite-light rounded-xl border border-white/5 p-6 mb-6">
        <h2 className="font-headline font-bold mb-4 text-sm uppercase tracking-wide">Convidar Novo Usuário</h2>
        <form onSubmit={handleInvite} className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-headline uppercase text-gray-400 mb-1">E-mail</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              placeholder="usuario@empresa.com"
              className="w-full px-4 py-3 bg-brand-grafite border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
            />
          </div>
          <div className="w-44">
            <label className="block text-xs font-headline uppercase text-gray-400 mb-1">Função</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full px-4 py-3 bg-brand-grafite border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
            >
              <option value="admin">Administrador</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="px-6 py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {inviting ? "Enviando..." : "Enviar Convite"}
          </button>
        </form>
        {inviteMsg && (
          <p className={`mt-3 text-sm ${inviteMsg.type === "ok" ? "text-green-400" : "text-red-400"}`}>
            {inviteMsg.text}
          </p>
        )}
        <p className="mt-3 text-xs text-gray-500">
          O usuário receberá um e-mail para definir sua senha e acessar o painel.
        </p>
      </div>

      {/* Members list */}
      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Função</th>
              <th className="px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400 text-right">Alterar Função</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-500 text-sm">Nenhum usuário encontrado.</td></tr>
            )}
            {members.map((m) => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{m.full_name || "—"}</p>
                  <p className="text-xs text-gray-500">{m.id === currentUserId ? "Você" : m.id.substring(0, 8) + "..."}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-headline uppercase px-2 py-0.5 rounded-full ${roleColors[m.role] || ""}`}>
                    {roleLabels[m.role] || m.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {m.id === currentUserId ? (
                    <span className="text-xs text-gray-600 font-headline uppercase">Sua conta</span>
                  ) : (
                    <select
                      value={m.role}
                      disabled={updatingId === m.id}
                      onChange={e => handleRoleChange(m.id, e.target.value)}
                      className="px-3 py-1.5 bg-brand-grafite border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 disabled:opacity-50"
                    >
                      <option value="admin">Administrador</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
