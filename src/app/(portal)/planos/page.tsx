import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Planos",
  description: "Planos de anúncio e geração de leads do Indústria News",
}

export const revalidate = 3600

export default async function PlanosPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase.from("plan_pricing").select("*").order("price_monthly")

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-black">PLANOS PARA ANUNCIANTES</h1>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          Não vendemos espaço publicitário. Entregamos dados, leads qualificados e inteligência comercial em tempo real para o seu time de vendas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(plans || []).map((plan: any) => {
          const features = typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features || []
          const isGold = plan.highlighted
          return (
            <div key={plan.id} className={`rounded-2xl p-6 flex flex-col ${isGold ? "bg-brand-grafite text-white border-2 border-brand-lavanda shadow-2xl relative" : "bg-white border border-gray-200 shadow-sm"}`}>
              {isGold && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-lavanda text-white text-[10px] font-headline uppercase tracking-widest px-4 py-1 rounded-full">
                  Mais Popular
                </span>
              )}
              <div className="mb-6">
                <h2 className={`font-headline text-lg font-bold ${isGold ? "text-brand-lavanda-light" : "text-brand-lavanda"}`}>{plan.name}</h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-4xl font-headline font-black ${isGold ? "text-white" : "text-brand-black"}`}>
                    R$ {Number(plan.price_monthly).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-sm ${isGold ? "text-gray-400" : "text-gray-500"}`}>/mês</span>
                </div>
                <p className={`text-sm mt-2 ${isGold ? "text-gray-300" : "text-gray-500"}`}>{plan.description}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 shrink-0 ${isGold ? "text-brand-lavanda-light" : "text-brand-lavanda"}`}>✓</span>
                    <span className={isGold ? "text-gray-200" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`block text-center py-3 rounded-xl font-headline uppercase text-sm transition-all ${isGold ? "bg-brand-lavanda hover:bg-brand-lavanda-dark text-white" : "bg-brand-grafite hover:bg-brand-black text-white"}`}>
                Falar com Comercial
              </Link>
            </div>
          )
        })}
      </div>
      <p className="text-center text-sm text-gray-400 mt-8">
        Contrato mínimo de 12 meses. Todos os planos incluem acesso ao Portal do Anunciante.
      </p>
    </div>
  )
}
