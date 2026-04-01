import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function RevistaAdminPage() {
  const supabase = await createClient()
  const { data: editions } = await supabase
    .from("magazine_editions")
    .select("id, title, slug, edition_number, year, month, published_at, pdf_url")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-black">EDIÇÕES DA REVISTA</h1>
        <Link href="/admin/revista/nova" className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors">
          + Nova Edição
        </Link>
      </div>

      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Edição</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Título</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Mês/Ano</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">PDF</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {(!editions || editions.length === 0) ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">Nenhuma edição cadastrada.</td></tr>
            ) : editions.map((ed: any) => (
              <tr key={ed.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm font-bold text-brand-lavanda">#{ed.edition_number}</td>
                <td className="px-4 py-3 text-sm">{ed.title}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {ed.month && ed.year ? `${String(ed.month).padStart(2, "0")}/${ed.year}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {ed.pdf_url ? (
                    <a href={ed.pdf_url} target="_blank" rel="noopener noreferrer" className="text-brand-lavanda hover:text-brand-lavanda-light text-xs font-headline uppercase">
                      Ver PDF
                    </a>
                  ) : <span className="text-gray-500 text-xs">Sem PDF</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-headline uppercase ${ed.published_at ? "text-green-400" : "text-yellow-400"}`}>
                    {ed.published_at ? "Publicada" : "Rascunho"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
