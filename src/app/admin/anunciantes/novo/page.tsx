"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function NovoAnunciantePage() {
  const [form, setForm] = useState({
    company_name: "", sector: "", contact_name: "", contact_email: "", contact_phone: "", plan: "bronze",
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from("advertisers").insert(form)

    if (!error) {
      router.push("/admin/anunciantes")
    } else {
      alert("Erro: " + error.message)
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">NOVO ANUNCIANTE</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Empresa</label>
          <input value={form.company_name} onChange={update("company_name")} required className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Setor</label>
          <input value={form.sector} onChange={update("sector")} className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Nome do contato</label>
            <input value={form.contact_name} onChange={update("contact_name")} required className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Telefone</label>
            <input value={form.contact_phone} onChange={update("contact_phone")} className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">E-mail</label>
          <input type="email" value={form.contact_email} onChange={update("contact_email")} required className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Plano</label>
          <select value={form.plan} onChange={update("plan")} className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50">
            <option value="bronze">Bronze</option>
            <option value="prata">Prata</option>
            <option value="ouro">Ouro</option>
          </select>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="px-6 py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline uppercase rounded-lg transition-colors disabled:opacity-50">
            {saving ? "Salvando..." : "Cadastrar"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-headline uppercase rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
