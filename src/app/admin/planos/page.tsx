"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type Plan = {
  id: string
  name: string
  price_monthly: number
  description: string
  features: string[]
  highlighted: boolean
}

export default function PlanosAdminPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", price_monthly: "", description: "", features: "", highlighted: false })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = () => {
    supabase.from("plan_pricing").select("*").order("price_monthly").then(({ data }) => {
      setPlans(data || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const startEdit = (plan: Plan) => {
    setEditing(plan.id)
    setForm({
      name: plan.name,
      price_monthly: String(plan.price_monthly),
      description: plan.description || "",
      features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      highlighted: plan.highlighted || false,
    })
  }

  const cancelEdit = () => { setEditing(null) }

  const handleSave = async (id: string) => {
    setSaving(true)
    const features = form.features.split("\n").map(f => f.trim()).filter(Boolean)
    const { error } = await supabase.from("plan_pricing").update({
      name: form.name,
      price_monthly: Number(form.price_monthly),
      description: form.description,
      features,
      highlighted: form.highlighted,
    }).eq("id", id)
    if (!error) {
      setEditing(null)
      load()
    } else {
      alert("Erro: " + error.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">PLANOS</h1>
      <p className="text-sm text-gray-400 mb-6">Edite os valores e benefícios de cada plano exibido na página pública.</p>

      <div className="space-y-4 max-w-3xl">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-brand-grafite-light rounded-xl border border-white/5 p-6">
            {editing === plan.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-headline uppercase text-gray-400 mb-1">Nome do Plano</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-brand-grafite border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-headline uppercase text-gray-400 mb-1">Preço Mensal (R$)</label>
                    <input type="number" step="0.01" value={form.price_monthly} onChange={e => setForm(p => ({ ...p, price_monthly: e.target.value }))}
                      className="w-full px-3 py-2 bg-brand-grafite border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase text-gray-400 mb-1">Descrição</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-brand-grafite border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase text-gray-400 mb-1">Benefícios (um por linha)</label>
                  <textarea value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 bg-brand-grafite border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 resize-y" />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.highlighted} onChange={e => setForm(p => ({ ...p, highlighted: e.target.checked }))} className="accent-brand-lavanda" />
                    <span className="text-sm text-gray-300">Destacar como "Mais Popular"</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleSave(plan.id)} disabled={saving}
                    className="px-5 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors disabled:opacity-50">
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button onClick={cancelEdit}
                    className="px-5 py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-headline text-sm uppercase rounded-lg transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-headline font-bold text-lg">{plan.name}</h2>
                    {plan.highlighted && (
                      <span className="text-[10px] font-headline uppercase bg-brand-lavanda/20 text-brand-lavanda-light px-2 py-0.5 rounded-full">Mais Popular</span>
                    )}
                  </div>
                  <p className="text-2xl font-headline font-black text-brand-lavanda">
                    R$ {Number(plan.price_monthly).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-gray-400">/mês</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                  <ul className="mt-3 space-y-1">
                    {(Array.isArray(plan.features) ? plan.features : []).map((f, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                        <span className="text-brand-lavanda mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => startEdit(plan)} className="text-xs text-brand-lavanda hover:text-brand-lavanda-light font-headline uppercase ml-4 shrink-0">
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
