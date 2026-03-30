import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function ArtigosAdminPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, status, published_at, source_name, categories(name)")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-black">ARTIGOS</h1>
        <Link
          href="/admin/artigos/novo"
          className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors"
        >
          + Novo Artigo
        </Link>
      </div>

      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Título</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Fonte</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Data</th>
            </tr>
          </thead>
          <tbody>
            {(articles || []).map((article: any) => {
              const cat = Array.isArray(article.categories) ? article.categories[0] : article.categories
              return (
                <tr key={article.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/artigos/${article.id}`} className="text-sm font-medium hover:text-brand-lavanda transition-colors">
                      {article.title.length > 60 ? article.title.substring(0, 60) + "..." : article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{cat?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{article.source_name || "Manual"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-headline uppercase px-2 py-0.5 rounded-full ${
                      article.status === "published" ? "text-green-400 bg-green-400/10" :
                      article.status === "draft" ? "text-yellow-400 bg-yellow-400/10" :
                      "text-gray-400 bg-gray-400/10"
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
