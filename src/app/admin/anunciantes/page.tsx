import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function AnunciantesAdminPage() {
  const supabase = await createClient()

  const { data: advertisers } = await supabase
    .from("advertisers")
    .select("id, company_name, contact_name, contact_email, plan, status, contract_end")
    .order("created_at", { ascending: false })

  const planColors: Record<string, string> = {
    bronze: "text-amber-600 bg-amber-600/10",
    prata: "text-gray-300 bg-gray-300/10",
    ouro: "text-yellow-400 bg-yellow-400/10",
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-black">ANUNCIANTES</h1>
        <Link
          href="/admin/anunciantes/novo"
          className="px-4 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white font-headline text-sm uppercase rounded-lg transition-colors"
        >
          + Novo Anunciante
        </Link>
      </div>

      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Contato</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Plano</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Contrato até</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(advertisers || []).map((adv: any) => (
              <tr key={adv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{adv.company_name}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  <div>{adv.contact_name}</div>
                  <div className="text-xs text-gray-500">{adv.contact_email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-headline uppercase px-2 py-0.5 rounded-full ${planColors[adv.plan] || ""}`}>
                    {adv.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-headline uppercase ${adv.status === "active" ? "text-green-400" : "text-gray-500"}`}>
                    {adv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {adv.contract_end ? new Date(adv.contract_end).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/anunciantes/${adv.id}`} className="text-xs text-brand-lavanda hover:text-brand-lavanda-light font-headline uppercase">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
