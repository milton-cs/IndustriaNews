import { createClient } from "@/lib/supabase/server"
import { RSS_SOURCES } from "@/lib/rss-engine"

export default async function ConfiguracoesAdminPage() {
  const supabase = await createClient()

  const { count: totalArticles } = await supabase.from("articles").select("id", { count: "exact", head: true })
  const { count: totalReaders } = await supabase.from("readers").select("id", { count: "exact", head: true })

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">CONFIGURAÇÕES</h1>

      <div className="grid gap-6 max-w-3xl">
        <div className="bg-brand-grafite-light rounded-xl p-6 border border-white/5">
          <h2 className="font-headline font-bold mb-4">GATE DE CONTEÚDO</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Bloquear após</span>
              <span className="text-sm font-medium text-brand-lavanda">3 parágrafos</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Campos obrigatórios</span>
              <span className="text-sm font-medium">Nome, E-mail</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Cookie de reconhecimento</span>
              <span className="text-sm font-medium text-green-400">Ativo (1 ano)</span>
            </div>
          </div>
        </div>

        <div className="bg-brand-grafite-light rounded-xl p-6 border border-white/5">
          <h2 className="font-headline font-bold mb-4">FONTES RSS ({RSS_SOURCES.length})</h2>
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {RSS_SOURCES.map((source) => (
              <div key={source.url} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-300">{source.name}</span>
                <span className="text-xs text-green-400 font-headline uppercase">Ativo</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-gray-400">Cron: Diário às 08:00 UTC</span>
            <span className="text-gray-400">{totalArticles || 0} artigos importados</span>
          </div>
        </div>

        <div className="bg-brand-grafite-light rounded-xl p-6 border border-white/5">
          <h2 className="font-headline font-bold mb-4">AUTOMAÇÕES</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">RSS Import</span>
              <span className="text-green-400 font-headline text-xs uppercase">Diário 08:00 UTC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Digest semanal de leads</span>
              <span className="text-green-400 font-headline text-xs uppercase">Toda segunda 09:00 UTC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Relatório mensal</span>
              <span className="text-green-400 font-headline text-xs uppercase">Dia 1 de cada mês</span>
            </div>
          </div>
        </div>

        <div className="bg-brand-grafite-light rounded-xl p-6 border border-white/5">
          <h2 className="font-headline font-bold mb-4">SISTEMA</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Plataforma</span>
              <span>Next.js 16 + Supabase</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Hospedagem</span>
              <span>Vercel (Production)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Banco de dados</span>
              <span>Supabase PostgreSQL (us-east-1)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">E-mail</span>
              <span>Resend</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Leitores cadastrados</span>
              <span className="text-brand-lavanda font-bold">{totalReaders || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
