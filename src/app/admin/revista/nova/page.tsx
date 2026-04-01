"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function NovaEdicaoPage() {
  const [title, setTitle] = useState("")
  const [editionNumber, setEditionNumber] = useState(1)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const slugify = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile) { alert("Selecione o arquivo PDF da revista"); return }
    setSaving(true)

    try {
      const slug = `edicao-${editionNumber}-${slugify(title)}`

      // 1. Upload PDF
      setProgress("Enviando PDF da revista...")
      const pdfPath = `edicao-${editionNumber}-${Date.now()}.pdf`
      const { error: pdfError } = await supabase.storage
        .from("revistas")
        .upload(pdfPath, pdfFile, { contentType: "application/pdf", upsert: true })

      if (pdfError) { alert("Erro no upload do PDF: " + pdfError.message); setSaving(false); return }

      const { data: pdfUrlData } = supabase.storage.from("revistas").getPublicUrl(pdfPath)
      const pdfUrl = pdfUrlData.publicUrl

      // 2. Upload capa (se fornecida)
      let coverUrl: string | null = null
      if (coverFile) {
        setProgress("Enviando capa...")
        const coverPath = `capa-edicao-${editionNumber}-${Date.now()}.jpg`
        const { error: coverError } = await supabase.storage
          .from("revistas")
          .upload(coverPath, coverFile, { contentType: coverFile.type, upsert: true })

        if (!coverError) {
          const { data: coverUrlData } = supabase.storage.from("revistas").getPublicUrl(coverPath)
          coverUrl = coverUrlData.publicUrl
        }
      }

      // 3. Criar edição no banco
      setProgress("Salvando edição...")
      const { error: dbError } = await supabase.from("magazine_editions").insert({
        title,
        slug,
        edition_number: editionNumber,
        month,
        year,
        pdf_url: pdfUrl,
        cover_image_url: coverUrl,
        published_at: new Date().toISOString(),
      })

      if (dbError) { alert("Erro ao salvar: " + dbError.message); setSaving(false); return }

      setProgress("Edição publicada!")
      router.push("/admin/revista")
    } catch (err) {
      alert("Erro inesperado")
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">NOVA EDIÇÃO DA REVISTA</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Título da Edição</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Transformação Digital na Mineração Brasileira"
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Nº da Edição</label>
            <input type="number" value={editionNumber} onChange={(e) => setEditionNumber(Number(e.target.value))} min={1}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Mês</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{new Date(2000, m-1).toLocaleDateString("pt-BR", { month: "long" })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Ano</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2024} max={2030}
              className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Arquivo PDF da Revista *</label>
          <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-lavanda file:text-white file:font-headline file:uppercase file:text-xs file:cursor-pointer" />
          <p className="text-xs text-gray-500 mt-1">O PDF será exibido no flipbook interativo da revista.</p>
        </div>

        <div>
          <label className="block text-sm font-headline uppercase text-gray-400 mb-1">Imagem de Capa (opcional)</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 bg-brand-grafite-light border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-lavanda/50 file:text-white file:font-headline file:uppercase file:text-xs file:cursor-pointer" />
          <p className="text-xs text-gray-500 mt-1">Se não enviar, será usada a primeira página do PDF como capa.</p>
        </div>

        {progress && (
          <div className="bg-brand-lavanda/10 border border-brand-lavanda/20 rounded-lg px-4 py-3 text-sm text-brand-lavanda">
            {progress}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-3 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline uppercase rounded-lg transition-colors disabled:opacity-50">
            {saving ? "Publicando..." : "Publicar Edição"}
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
