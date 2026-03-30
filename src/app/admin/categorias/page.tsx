"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CategoriasAdminPage() {
  const [categories, setCategories] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from("categories").select("id, name, slug, description, color, sort_order").order("sort_order").then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir a categoria "${name}"? Artigos nesta categoria ficarão sem categoria.`)) return
    await supabase.from("categories").delete().eq("id", id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-black">CATEGORIAS</h1>
        <Link href="/admin/categorias/nova" className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors">
          + Nova Categoria
        </Link>
      </div>
      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">#</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Descrição</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-500">{cat.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color || '#8E9ED6' }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 font-mono">{cat.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{cat.description || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/categorias/${cat.id}`} className="text-xs text-brand-lavanda hover:text-brand-lavanda-light font-headline uppercase">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-red-400 hover:text-red-300 font-headline uppercase">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
