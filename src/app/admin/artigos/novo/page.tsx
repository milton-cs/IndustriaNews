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
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
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

  const handleUploadImage = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        alert("Erro no upload: " + (data.error || "Falha desconhecida"))
      } else {
        setCoverImageUrl(data.url)
      }
    } catch {
      alert("Erro de conexão ao enviar imagem")
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Upload image file if selected
    if (coverFile && !coverImageUrl) {
      await handleUploadImage(coverFile)
    }

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
          <label className="block text-sm font-headline uppercase text-gray-400 mb-2">Imagem de Capa</label>
          <div className="space-y-3">
            {/* Upload de arquivo */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setCoverFile(file)
                    handleUploadImage(file)
                  }
                }}
                className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-lavanda file:text-white file:font-headline file:uppercase file:text-xs file:cursor-pointer"
              />
              {uploading && <p className="text-xs text-brand-lavanda mt-1">Enviando imagem...</p>}
            </div>
            {/* Ou colar URL */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">ou cole uma URL:</span>
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                type="url"
                className="flex-1 px-3 py-2 bg-brand-grafite-light border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
                placeholder="https://..."
              />
            </div>
            {/* Preview */}
            {coverImageUrl && (
              <img src={coverImageUrl} alt="Preview" className="h-40 w-full object-cover rounded-lg border border-white/10" />
            )}
          </div>
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
