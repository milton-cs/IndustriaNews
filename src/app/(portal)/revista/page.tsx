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
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300">
                {edition.cover_image_url ? (
                  <>
                    <Image
                      src={edition.cover_image_url}
                      alt={edition.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                    <div className="absolute top-4 left-4">
                      <Image
                        src="/logo-positiva.png"
                        alt="Indústria News"
                        width={80}
                        height={40}
                        className="h-8 w-auto brightness-200 drop-shadow-lg"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="text-brand-lavanda-light font-headline text-[10px] uppercase tracking-widest">
                        Edição {edition.edition_number} · {edition.month && edition.year
                          ? new Date(edition.year, edition.month - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                          : ""}
                      </span>
                      <h3 className="font-headline text-white text-lg font-black leading-tight mt-1">
                        {edition.title}
                      </h3>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-brand-grafite">
                    <div className="text-center">
                      <Image src="/logo-positiva.png" alt="Indústria News" width={120} height={60} className="h-16 w-auto mx-auto brightness-200 mb-4" />
                      <span className="text-gray-400 text-sm block">Edição {edition.edition_number}</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-3">
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
