import { createClient } from "@/lib/supabase/server"
import { PdfViewer } from "@/components/magazine/pdf-viewer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("magazine_editions").select("title").eq("slug", slug).single()
  if (!data) return {}
  return { title: `Revista — ${data.title}` }
}

export const revalidate = 300

export default async function MagazineEditionPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: edition } = await supabase
    .from("magazine_editions")
    .select("id, title, cover_image_url, edition_number, year, month, pdf_url")
    .eq("slug", slug)
    .single()

  if (!edition) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-brand-lavanda font-headline text-sm uppercase tracking-wide">
          Edição {edition.edition_number} · {edition.month && edition.year
            ? new Date(edition.year, edition.month - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
            : ""}
        </span>
        <h1 className="font-headline text-3xl md:text-4xl font-black mt-2">{edition.title}</h1>
      </div>

      {edition.pdf_url ? (
        <PdfViewer pdfUrl={edition.pdf_url} title={edition.title} />
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">Conteúdo em preparação.</p>
        </div>
      )}
    </div>
  )
}
