"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function EditArtigoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("draft")
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from("articles").select("*").eq("id", id).single(),
      supabase.from("categories").select("id, name").order("sort_order"),
    ]).then(([articleRes, catRes]) => {
      if (articleRes.data) {
        setTitle(articleRes.data.title)
        setContent(articleRes.data.content)
        setExcerpt(articleRes.data.excerpt || "")
        setCategoryId(articleRes.data.category_id || "")
        setStatus(articleRes.data.status)
      }
      setCategories(catRes.data || [])
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from("articles").update({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category_id: categoryId || null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("id", id)

    if (!error) {
      router.push("/admin/artigos")
    } else {
      alert("Erro: " + error.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return
    await supabase.from("articles").delete().eq("id", id)
    router.push("/admin/artigos")
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-black">EDITAR ARTIGO</h1>
        <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 font-headline uppercase">
          Excluir Artigo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Categoria</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50">
            <option value="">Sem categoria</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Resumo</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Conteúdo</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={15}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 resize-y" />
        </div>
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="draft" checked={status === "draft"} onChange={(e) => setStatus(e.target.value)} className="accent-brand-lavanda" />
              <span className="text-sm">Rascunho</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="published" checked={status === "published"} onChange={(e) => setStatus(e.target.value)} className="accent-brand-lavanda" />
              <span className="text-sm">Publicado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="archived" checked={status === "archived"} onChange={(e) => setStatus(e.target.value)} className="accent-brand-lavanda" />
              <span className="text-sm">Arquivado</span>
            </label>
          </div>
        </div>
        <div className="flex gap-4">
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
