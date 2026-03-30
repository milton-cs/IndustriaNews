import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("magazine_editions")
    .select("title")
    .eq("slug", slug)
    .single()
  if (!data) return {}
  return { title: `Revista — ${data.title}` }
}

export const revalidate = 300

export default async function MagazineEditionPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: edition } = await supabase
    .from("magazine_editions")
    .select("id, title, cover_image_url, edition_number, year, month")
    .eq("slug", slug)
    .single()

  if (!edition) notFound()

  const { data: pages } = await supabase
    .from("magazine_pages")
    .select("id, page_number, type, content, image_url")
    .eq("edition_id", edition.id)
    .order("page_number")

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <span className="text-brand-lavanda font-headline text-sm uppercase tracking-wide">
          Edição {edition.edition_number} · {edition.month && edition.year
            ? new Date(edition.year, edition.month - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
            : ""}
        </span>
        <h1 className="font-headline text-4xl font-black mt-2">{edition.title}</h1>
      </div>

      {(!pages || pages.length === 0) ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Conteúdo em preparação.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {pages.map((page: any) => (
            <section key={page.id} className="scroll-mt-20">
              {page.image_url && (
                <img
                  src={page.image_url}
                  alt={`Página ${page.page_number}`}
                  className="w-full rounded-xl shadow-lg mb-6"
                />
              )}
              {page.content && (
                <div className="prose prose-lg max-w-none">
                  {page.content.split("\n").filter(Boolean).map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
