import { createClient } from "@/lib/supabase/server"

export default async function CategoriasAdminPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, color, sort_order")
    .order("sort_order")

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">CATEGORIAS</h1>
      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">#</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Descri&ccedil;&atilde;o</th>
            </tr>
          </thead>
          <tbody>
            {(categories || []).map((cat: any) => (
              <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-500">{cat.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: cat.color || '#8E9ED6' }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 font-mono">{cat.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{cat.description || "\u2014"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
