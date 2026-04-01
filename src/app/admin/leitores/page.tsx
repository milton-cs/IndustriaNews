import { createClient } from "@/lib/supabase/server"

export default async function LeitoresAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page } = await searchParams
  const supabase = await createClient()
  const pageSize = 50
  const currentPage = Number(page || 1)
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("readers")
    .select("id, name, email, company, position, phone, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`)
  }

  const { data: readers, count } = await query
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-2xl font-black">LEITORES CADASTRADOS</h1>
          <p className="text-sm text-gray-400 mt-1">{count?.toLocaleString("pt-BR") || 0} leitores no total</p>
        </div>
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por nome, e-mail ou empresa..."
            className="px-4 py-2 bg-brand-grafite-light border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50 w-72"
          />
          <button type="submit" className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors">
            Buscar
          </button>
          {q && (
            <a href="/admin/leitores" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-headline text-sm uppercase rounded-lg transition-colors">
              Limpar
            </a>
          )}
        </form>
      </div>

      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">E-mail</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Cargo</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Telefone</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            {(!readers || readers.length === 0) ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  {q ? "Nenhum leitor encontrado para essa busca." : "Nenhum leitor cadastrado ainda."}
                </td>
              </tr>
            ) : (
              readers.map((r: any) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{r.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{r.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{r.company || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.position || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.phone || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a href={`/admin/leitores?${q ? `q=${q}&` : ""}page=${currentPage - 1}`}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-headline text-xs uppercase rounded-lg transition-colors">
                Anterior
              </a>
            )}
            {currentPage < totalPages && (
              <a href={`/admin/leitores?${q ? `q=${q}&` : ""}page=${currentPage + 1}`}
                className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-xs uppercase rounded-lg transition-colors">
                Próxima
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
