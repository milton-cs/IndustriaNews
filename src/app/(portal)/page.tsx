import { createClient } from "@/lib/supabase/server"
import { FeaturedArticle } from "@/components/articles/featured-article"
import { CategorySection } from "@/components/articles/category-section"
import { LoadMoreGrid } from "@/components/articles/load-more-grid"
import { normalizeArticle } from "@/lib/types"

export const revalidate = 300

export default async function HomePage() {
  const supabase = await createClient()

  // Featured article
  const { data: featuredRow } = await supabase
    .from("articles")
    .select("title, slug, excerpt, cover_image_url, published_at, source_name, categories(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .single()

  const featured = featuredRow ? normalizeArticle(featuredRow) : null

  // Top categories with article counts
  const { data: categoriesWithCounts } = await supabase
    .rpc("get_categories_with_counts")
    .limit(5)

  // If RPC doesn't exist, fall back to fetching categories directly
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order")
    .limit(6)

  const categories = allCategories || []

  // Fetch articles for each category (parallel)
  const categoryArticles = await Promise.all(
    categories.map(async (cat: any) => {
      const { data } = await supabase
        .from("articles")
        .select("title, slug, excerpt, cover_image_url, published_at, source_name, categories(name, slug)")
        .eq("status", "published")
        .eq("category_id", cat.id)
        .order("published_at", { ascending: false })
        .limit(4)
      return {
        name: cat.name,
        slug: cat.slug,
        articles: (data || []).map(normalizeArticle),
      }
    })
  )

  // Latest articles for load-more grid (skip featured)
  const { data: latestRows } = await supabase
    .from("articles")
    .select("title, slug, excerpt, cover_image_url, published_at, source_name, categories(name, slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(1, 12)

  const latest = latestRows?.map(normalizeArticle) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      {featured && (
        <section className="mb-12">
          <FeaturedArticle article={featured} />
        </section>
      )}

      {/* Category Sections */}
      {categoryArticles
        .filter((cs) => cs.articles.length > 0)
        .map((cs) => (
          <CategorySection key={cs.slug} name={cs.name} slug={cs.slug} articles={cs.articles} />
        ))}

      {/* All News with Load More */}
      <section className="mt-4">
        <h2 className="font-headline text-xl font-bold mb-6 border-b-2 border-brand-lavanda pb-2 inline-block">
          TODAS AS NOTÍCIAS
        </h2>
        <LoadMoreGrid initialArticles={latest} initialOffset={13} />
      </section>
    </div>
  )
}
