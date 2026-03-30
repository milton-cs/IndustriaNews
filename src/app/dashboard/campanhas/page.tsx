import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CampanhasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("advertiser_id")
    .eq("id", user.id)
    .single()

  let campaigns: any[] = []
  if (profile?.advertiser_id) {
    const { data } = await supabase
      .from("campaigns")
      .select("id, name, type, status, start_date, end_date, tracking_token")
      .eq("advertiser_id", profile.advertiser_id)
      .order("created_at", { ascending: false })
    campaigns = data || []
  }

  const statusColors: Record<string, string> = {
    active: "text-green-400 bg-green-400/10",
    draft: "text-gray-400 bg-gray-400/10",
    paused: "text-yellow-400 bg-yellow-400/10",
    ended: "text-red-400 bg-red-400/10",
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">CAMPANHAS</h1>

      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <div className="bg-brand-grafite-light rounded-xl p-8 text-center border border-white/5">
            <p className="text-gray-400">Nenhuma campanha ativa.</p>
          </div>
        ) : (
          campaigns.map((campaign: any) => (
            <div key={campaign.id} className="bg-brand-grafite-light rounded-xl p-5 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-headline font-bold text-lg">{campaign.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-headline uppercase ${statusColors[campaign.status] || ""}`}>
                  {campaign.status}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>Tipo: {campaign.type}</span>
                {campaign.start_date && <span>Início: {new Date(campaign.start_date).toLocaleDateString("pt-BR")}</span>}
                {campaign.end_date && <span>Fim: {new Date(campaign.end_date).toLocaleDateString("pt-BR")}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
