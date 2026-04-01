"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function EditAnunciantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [form, setForm] = useState({
    company_name: "", sector: "", contact_name: "", contact_email: "", contact_phone: "",
    plan: "bronze", status: "active",
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from("advertisers").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setForm({
          company_name: data.company_name || "",
          sector: data.sector || "",
          contact_name: data.contact_name || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          plan: data.plan || "bronze",
          status: data.status || "active",
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
    const { error } = await supabase.from("advertisers").update(form).eq("id", id)
    if (!error) {
      router.push("/admin/anunciantes")
    } else {
      alert("Erro: " + error.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este anunciante? Todos os dados relacionados serão removidos.")) return
    const { error } = await supabase.from("advertisers").delete().eq("id", id)
    if (!error) {
      router.push("/admin/anunciantes")
    } else {
      alert("Erro ao excluir: " + error.message)
    }
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-black">EDITAR ANUNCIANTE</h1>
        <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 font-headline uppercase">
          Excluir Anunciante
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Empresa</label>
          <input value={form.company_name} onChange={update("company_name")} required
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Setor</label>
          <input value={form.sector} onChange={update("sector")}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Nome do contato</label>
            <input value={form.contact_name} onChange={update("contact_name")} required
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Telefone</label>
            <input value={form.contact_phone} onChange={update("contact_phone")}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">E-mail</label>
          <input type="email" value={form.contact_email} onChange={update("contact_email")} required
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
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
              <option value="suspended">Suspenso</option>
            </select>
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
