"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function EditContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [form, setForm] = useState({
    plan: "bronze", value: "", period_months: "12", status: "active",
    signed_at: "", expires_at: "",
  })
  const [advertiserName, setAdvertiserName] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from("contracts").select("*, advertisers(company_name)").eq("id", id).single().then(({ data }) => {
      if (data) {
        const adv = Array.isArray(data.advertisers) ? data.advertisers[0] : data.advertisers
        setAdvertiserName(adv?.company_name || "")
        setForm({
          plan: data.plan || "bronze",
          value: data.value ? String(data.value) : "",
          period_months: data.period_months ? String(data.period_months) : "12",
          status: data.status || "active",
          signed_at: data.signed_at ? data.signed_at.substring(0, 10) : "",
          expires_at: data.expires_at ? data.expires_at.substring(0, 10) : "",
        })
      }
      setLoading(false)
    })
  }, [id])

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("contracts").update({
      plan: form.plan,
      value: form.value ? Number(form.value) : null,
      period_months: form.period_months ? Number(form.period_months) : null,
      status: form.status,
      signed_at: form.signed_at || null,
      expires_at: form.expires_at || null,
    }).eq("id", id)
    if (!error) {
      router.push("/admin/contratos")
    } else {
      alert("Erro: " + error.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return
    const { error } = await supabase.from("contracts").delete().eq("id", id)
    if (!error) {
      router.push("/admin/contratos")
    } else {
      alert("Erro ao excluir: " + error.message)
    }
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-2xl font-black">EDITAR CONTRATO</h1>
          {advertiserName && <p className="text-gray-400 text-sm mt-1">{advertiserName}</p>}
        </div>
        <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 font-headline uppercase">
          Excluir Contrato
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Plano</label>
            <select value={form.plan} onChange={update("plan")}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50">
              <option value="bronze">Bronze</option>
              <option value="prata">Prata</option>
              <option value="ouro">Ouro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Status</label>
            <select value={form.status} onChange={update("status")}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Valor (R$)</label>
            <input type="number" step="0.01" value={form.value} onChange={update("value")}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
              placeholder="0,00" />
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Período (meses)</label>
            <input type="number" value={form.period_months} onChange={update("period_months")}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Assinado em</label>
            <input type="date" value={form.signed_at} onChange={update("signed_at")}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Expira em</label>
            <input type="date" value={form.expires_at} onChange={update("expires_at")}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline uppercase rounded-lg transition-colors disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-headline uppercase rounded-lg transition-colors">
            Voltar
          </button>
        </div>
      </form>
    </div>
  )
}
