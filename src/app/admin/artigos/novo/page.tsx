"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function NovoArtigoPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("draft")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  const slugify = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").substring(0, 200)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const slug = slugify(title) + "-" + Date.now().toString(36)

    const { error } = await supabase.from("articles").insert({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category_id: categoryId || null,
      status,
      cover_image_url: coverImageUrl || null,
      published_at: status === "published" ? new Date().toISOString() : null,
    })

    if (!error) {
      router.push("/admin/artigos")
    } else {
      alert("Erro ao salvar: " + error.message)
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">NOVO ARTIGO</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
            placeholder="Título da notícia..."
          />
        </div>

        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Imagem de Capa (URL)</label>
          <input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            type="url"
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
            placeholder="https://..."
          />
          {coverImageUrl && (
            <img src={coverImageUrl} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg opacity-80" />
          )}
        </div>

        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Resumo</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 resize-none"
            placeholder="Breve resumo (max 200 caracteres)..."
          />
        </div>

        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Conteúdo</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 resize-y"
            placeholder="Texto completo do artigo..."
          />
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
              <span className="text-sm">Publicar agora</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline uppercase rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Artigo"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-headline uppercase rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
