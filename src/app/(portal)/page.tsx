import { createClient } from "@/lib/supabase/server"
import { FeaturedArticle } from "@/components/articles/featured-article"
import { ArticleGrid } from "@/components/articles/article-grid"
import { normalizeArticle } from "@/lib/types"

export const revalidate = 300

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredRow } = await supabase
    .from("articles")
    .select("title, slug, excerpt, cover_image_url, published_at, categories(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single()

  const { data: latestRows } = await supabase
    .from("articles")
    .select("title, slug, excerpt, cover_image_url, published_at, categories(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(1, 12)

  const featured = featuredRow ? normalizeArticle(featuredRow) : null
  const latest = latestRows?.map(normalizeArticle) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {featured && (
        <section className="mb-10">
          <FeaturedArticle article={featured} />
        </section>
      )}

      <section>
        <h2 className="font-headline text-xl font-bold mb-6 border-b-2 border-brand-lavanda pb-2 inline-block">
          ÚLTIMAS NOTÍCIAS
        </h2>
        {latest.length > 0 ? (
          <ArticleGrid articles={latest} />
        ) : (
          <p className="text-gray-400 text-center py-12">
            Nenhuma notícia publicada ainda.
          </p>
        )}
      </section>
    </div>
  )
}
