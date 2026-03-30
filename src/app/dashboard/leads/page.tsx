import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("advertiser_id")
    .eq("id", user.id)
    .single()

  let leads: any[] = []

  if (profile?.advertiser_id) {
    const { data: events } = await supabase
      .from("tracking_events")
      .select("reader_id, event_type, created_at, metadata, readers(id, name, email, phone, company, position, lead_score)")
      .eq("advertiser_id", profile.advertiser_id)
      .in("event_type", ["ad_click", "gate_submit"])
      .not("reader_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(100)

    // Deduplicate by reader_id
    const seen = new Set<string>()
    leads = (events || []).filter((e: any) => {
      if (!e.readers || seen.has(e.reader_id)) return false
      seen.add(e.reader_id)
      return true
    }).map((e: any) => {
      const reader = Array.isArray(e.readers) ? e.readers[0] : e.readers
      return {
        ...reader,
        last_event: e.event_type,
        last_seen: e.created_at,
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-black">LEADS</h1>
        <a href="/api/leads/export" className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors">
          Exportar CSV
        </a>
        <span className="text-sm text-gray-400">{leads.length} leads encontrados</span>
      </div>

      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Cargo</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Contato</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Score</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Último</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  Nenhum lead capturado ainda.
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{lead.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.company || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{lead.position || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {lead.email && <span className="text-gray-300">{lead.email}</span>}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-xs font-headline uppercase"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${lead.lead_score >= 50 ? "text-yellow-400" : "text-gray-400"}`}>
                      {lead.lead_score || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {lead.last_seen ? new Date(lead.last_seen).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
