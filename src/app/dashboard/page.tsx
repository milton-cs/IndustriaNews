import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

async function getAdvertiserMetrics(supabase: any, advertiserId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const [viewsRes, clicksRes, leadsRes, hotLeadsRes] = await Promise.all([
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .eq("advertiser_id", advertiserId)
      .eq("event_type", "ad_impression")
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .eq("advertiser_id", advertiserId)
      .eq("event_type", "ad_click")
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .eq("advertiser_id", advertiserId)
      .in("event_type", ["ad_click", "gate_submit"])
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("tracking_events")
      .select("id", { count: "exact", head: true })
      .eq("advertiser_id", advertiserId)
      .eq("event_type", "ad_click")
      .gte("created_at", twentyFourHoursAgo),
  ])

  return {
    impressions: viewsRes.count || 0,
    clicks: clicksRes.count || 0,
    leads: leadsRes.count || 0,
    hotLeads: hotLeadsRes.count || 0,
    ctr: viewsRes.count ? ((clicksRes.count || 0) / viewsRes.count * 100).toFixed(1) : "0",
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("advertiser_id")
    .eq("id", user.id)
    .single()

  const advertiserId = profile?.advertiser_id

  let metrics = { impressions: 0, clicks: 0, leads: 0, hotLeads: 0, ctr: "0" }
  let advertiser = null

  if (advertiserId) {
    metrics = await getAdvertiserMetrics(supabase, advertiserId)
    const { data } = await supabase
      .from("advertisers")
      .select("company_name, plan, contract_end")
      .eq("id", advertiserId)
      .single()
    advertiser = data
  }

  const cards = [
    { label: "Impressões (30d)", value: metrics.impressions.toLocaleString("pt-BR"), color: "text-white" },
    { label: "Cliques (30d)", value: metrics.clicks.toLocaleString("pt-BR"), color: "text-brand-lavanda" },
    { label: "Leads Gerados", value: metrics.leads.toLocaleString("pt-BR"), color: "text-green-400" },
    { label: "Leads Quentes (24h)", value: metrics.hotLeads.toLocaleString("pt-BR"), color: "text-yellow-400" },
    { label: "CTR", value: metrics.ctr + "%", color: "text-brand-lavanda-light" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline text-2xl font-black">
          {advertiser ? `BEM-VINDO, ${advertiser.company_name}` : "DASHBOARD"}
        </h1>
        {advertiser && (
          <p className="text-gray-400 text-sm mt-1">
            Plano {advertiser.plan.charAt(0).toUpperCase() + advertiser.plan.slice(1)}
            {advertiser.contract_end && ` · Contrato até ${new Date(advertiser.contract_end).toLocaleDateString("pt-BR")}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-brand-grafite-light rounded-xl p-5 border border-white/5">
            <p className="text-gray-400 text-xs font-headline uppercase tracking-wide mb-2">{card.label}</p>
            <p className={`text-3xl font-headline font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {!advertiserId && (
        <div className="bg-brand-grafite-light rounded-xl p-8 text-center border border-white/5">
          <p className="text-gray-400">Sua conta ainda não está vinculada a um anunciante.</p>
          <p className="text-gray-500 text-sm mt-2">Entre em contato com o comercial do Indústria News.</p>
        </div>
      )}
    </div>
  )
}
