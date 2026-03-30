import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function RelatoriosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("advertiser_id")
    .eq("id", user.id)
    .single()

  let reports: any[] = []
  if (profile?.advertiser_id) {
    const { data } = await supabase
      .from("reports")
      .select("id, period_start, period_end, pdf_url, status, created_at")
      .eq("advertiser_id", profile.advertiser_id)
      .order("created_at", { ascending: false })
    reports = data || []
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">RELATÓRIOS</h1>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <div className="bg-brand-grafite-light rounded-xl p-8 text-center border border-white/5">
            <p className="text-gray-400">Nenhum relatório gerado ainda.</p>
            <p className="text-gray-500 text-sm mt-2">Relatórios são gerados automaticamente no 1º dia de cada mês.</p>
          </div>
        ) : (
          reports.map((report: any) => (
            <div key={report.id} className="bg-brand-grafite-light rounded-xl p-5 border border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold">
                  Relatório {new Date(report.period_start).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Gerado em {new Date(report.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {report.pdf_url && report.status === "ready" ? (
                <a
                  href={report.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors"
                >
                  Download PDF
                </a>
              ) : (
                <span className="text-xs text-yellow-400 font-headline uppercase">Gerando...</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
