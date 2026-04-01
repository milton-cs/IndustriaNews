import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { ParceiroForm } from "./parceiro-form"

export default async function ParceiroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("id, company_name, contact_name")
    .eq("id", id)
    .eq("status", "ativo")
    .single()

  if (!advertiser) notFound()

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <span className="text-brand-lavanda font-headline text-sm font-bold uppercase tracking-widest">
              Indústria News × {advertiser.company_name}
            </span>
          </div>
          <h1 className="font-headline text-3xl font-black text-brand-black leading-tight mb-4">
            FALE COM A EQUIPE DE<br />
            <span className="text-brand-lavanda">{advertiser.company_name.toUpperCase()}</span>
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Deixe seus dados e a equipe de {advertiser.company_name} entrará em contato com você.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <ParceiroForm advertiserId={advertiser.id} advertiserName={advertiser.company_name} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Esta página é exclusiva para parceiros do{" "}
          <a href="/" className="text-brand-lavanda hover:underline">Indústria News</a>.
        </p>
      </div>
    </div>
  )
}
