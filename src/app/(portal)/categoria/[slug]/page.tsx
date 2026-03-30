import { createClient } from "@/lib/supabase/server"
import { ArticleGrid } from "@/components/articles/article-grid"
import { normalizeArticle } from "@/lib/types"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single()

  if (!category) return {}

  return {
    title: category.name,
    description: category.description || "Notícias sobre " + category.name,
  }
}

export const revalidate = 300

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single()

  if (!category) notFound()

  const { data: rows } = await supabase
    .from("articles")
    .select("title, slug, excerpt, cover_image_url, published_at, source_name, categories(name, slug)")
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false })
    .limit(24)

  const articles = rows?.map(normalizeArticle) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-black">{category.name}</h1>
        {category.description && (
          <p className="text-gray-500 mt-2">{category.description}</p>
        )}
      </div>
      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <p className="text-gray-400 text-center py-12">
          Nenhuma notícia nesta categoria ainda.
        </p>
      )}
    </div>
  )
}
