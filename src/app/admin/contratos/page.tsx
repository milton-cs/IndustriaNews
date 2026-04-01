import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function ContratosAdminPage() {
  const supabase = await createClient()

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, plan, value, period_months, status, signed_at, expires_at, advertisers(company_name)")
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="font-headline text-2xl font-black mb-6">CONTRATOS</h1>

      <div className="bg-brand-grafite-light rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Anunciante</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Plano</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-headline uppercase tracking-wide text-gray-400">Expira</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(!contracts || contracts.length === 0) ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">Nenhum contrato registrado.</td></tr>
            ) : (
              contracts.map((c: any) => {
                const adv = Array.isArray(c.advertisers) ? c.advertisers[0] : c.advertisers
                return (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-sm">{adv?.company_name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-brand-lavanda font-headline uppercase">{c.plan}</td>
                    <td className="px-4 py-3 text-sm">{c.value ? `R$ ${Number(c.value).toLocaleString("pt-BR")}` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-headline uppercase ${c.status === "active" ? "text-green-400" : "text-gray-500"}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/contratos/${c.id}`} className="text-xs text-brand-lavanda hover:text-brand-lavanda-light font-headline uppercase">
                        Editar
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
