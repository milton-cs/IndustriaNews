import { createClient } from "@/lib/supabase/server"

export default async function AdminPage() {
  const supabase = await createClient()

  const [articlesRes, readersRes, advertisersRes, eventsRes] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("readers").select("id", { count: "exact", head: true }),
    supabase.from("advertisers").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tracking_events").select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ])

  const stats = [
    { label: "Artigos Publicados", value: articlesRes.count || 0 },
    { label: "Leitores Cadastrados", value: readersRes.count || 0 },
    { label: "Anunciantes Ativos", value: advertisersRes.count || 0 },
    { label: "Eventos (24h)", value: eventsRes.count || 0 },
  ]

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">PAINEL ADMINISTRATIVO</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-brand-grafite-light rounded-xl p-5 border border-white/5">
            <p className="text-gray-400 text-xs font-headline uppercase tracking-wide mb-2">{stat.label}</p>
            <p className="text-3xl font-headline font-black text-brand-lavanda">{stat.value.toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-grafite-light rounded-xl p-5 border border-white/5">
          <h2 className="font-headline font-bold mb-4">AÇÕES RÁPIDAS</h2>
          <div className="space-y-2">
            <a href="/admin/artigos/novo" className="block px-4 py-3 bg-brand-lavanda/10 hover:bg-brand-lavanda/20 rounded-lg text-sm transition-colors">
              + Novo Artigo
            </a>
            <a href="/admin/anunciantes/novo" className="block px-4 py-3 bg-brand-lavanda/10 hover:bg-brand-lavanda/20 rounded-lg text-sm transition-colors">
              + Novo Anunciante
            </a>
            <a href="/admin/contratos/novo" className="block px-4 py-3 bg-brand-lavanda/10 hover:bg-brand-lavanda/20 rounded-lg text-sm transition-colors">
              + Novo Contrato
            </a>
          </div>
        </div>

        <div className="bg-brand-grafite-light rounded-xl p-5 border border-white/5">
          <h2 className="font-headline font-bold mb-4">CATEGORIAS SEM ANUNCIANTE</h2>
          <p className="text-gray-500 text-sm">As categorias com tráfego órfão aparecerão aqui quando houver dados de tracking.</p>
        </div>
      </div>
    </div>
  )
}
