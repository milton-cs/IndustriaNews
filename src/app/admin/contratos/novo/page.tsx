"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function NovoContratoPage() {
  const [form, setForm] = useState({
    advertiser_id: "", plan: "bronze", value: "", period_months: "12",
    status: "active", signed_at: "", expires_at: "",
  })
  const [advertisers, setAdvertisers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from("advertisers").select("id, company_name").order("company_name").then(({ data }) => {
      setAdvertisers(data || [])
    })
  }, [])

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("contracts").insert({
      advertiser_id: form.advertiser_id || null,
      plan: form.plan,
      value: form.value ? Number(form.value) : null,
      period_months: form.period_months ? Number(form.period_months) : null,
      status: form.status,
      signed_at: form.signed_at || null,
      expires_at: form.expires_at || null,
    })
    if (!error) {
      router.push("/admin/contratos")
    } else {
      alert("Erro: " + error.message)
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">NOVO CONTRATO</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Anunciante</label>
          <select value={form.advertiser_id} onChange={update("advertiser_id")} required
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50">
            <option value="">Selecione o anunciante</option>
            {advertisers.map(a => <option key={a.id} value={a.id}>{a.company_name}</option>)}
          </select>
        </div>
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
              placeholder="0,00"
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
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
            {saving ? "Salvando..." : "Cadastrar Contrato"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-headline uppercase rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
