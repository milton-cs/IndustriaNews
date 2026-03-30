"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function EditCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#8E9ED6")
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from("categories").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setName(data.name)
        setSlug(data.slug)
        setDescription(data.description || "")
        setColor(data.color || "#8E9ED6")
        setSortOrder(data.sort_order || 0)
      }
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("categories").update({ name, slug, description, color, sort_order: sortOrder }).eq("id", id)
    if (!error) router.push("/admin/categorias")
    else alert("Erro: " + error.message)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm("Excluir esta categoria? Artigos ficarão sem categoria.")) return
    await supabase.from("categories").delete().eq("id", id)
    router.push("/admin/categorias")
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-black">EDITAR CATEGORIA</h1>
        <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 font-headline uppercase">Excluir Categoria</button>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 resize-none" />
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
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-headline uppercase rounded-lg transition-colors">
            Voltar
          </button>
        </div>
      </form>
    </div>
  )
}
