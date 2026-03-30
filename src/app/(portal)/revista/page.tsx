import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Revista",
  description: "Edições da Revista Indústria News — Conteúdo exclusivo para o setor industrial",
}

export const revalidate = 300

export default async function RevistaPage() {
  const supabase = await createClient()

  const { data: editions } = await supabase
    .from("magazine_editions")
    .select("id, title, slug, cover_image_url, edition_number, year, month, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-headline text-3xl font-black mb-8">REVISTA INDÚSTRIA NEWS</h1>

      {(!editions || editions.length === 0) ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Em breve — novas edições da revista.</p>
          <p className="text-gray-500 text-sm mt-2">A primeira edição digital interativa está sendo preparada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {editions.map((edition: any) => (
            <Link key={edition.id} href={`/revista/${edition.slug}`} className="group block">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-brand-grafite shadow-lg">
                {edition.cover_image_url ? (
                  <Image
                    src={edition.cover_image_url}
                    alt={edition.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <span className="font-headline text-xl font-bold text-brand-lavanda block">INDÚSTRIA</span>
                      <span className="font-headline text-2xl font-black text-white block -mt-1">NEWS</span>
                      <span className="text-gray-400 text-sm mt-4 block">Edição {edition.edition_number}</span>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="font-headline font-bold text-lg mt-4 group-hover:text-brand-lavanda transition-colors">
                {edition.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {edition.month && edition.year
                  ? new Date(edition.year, edition.month - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                  : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
