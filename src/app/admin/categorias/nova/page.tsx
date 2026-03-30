"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export default function NovaCategoriaPage() {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#8E9ED6")
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(slugify(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("categories").insert({ name, slug, description, color, sort_order: sortOrder })
    if (!error) router.push("/admin/categorias")
    else alert("Erro: " + error.message)
    setSaving(false)
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">NOVA CATEGORIA</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Nome</label>
          <input value={name} onChange={(e) => handleNameChange(e.target.value)} required className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" placeholder="Ex: Agronegócio" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 resize-none" placeholder="Breve descrição do setor..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Cor</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Ordem</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="px-6 py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline uppercase rounded-lg transition-colors disabled:opacity-50">
            {saving ? "Salvando..." : "Criar Categoria"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-headline uppercase rounded-lg transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
