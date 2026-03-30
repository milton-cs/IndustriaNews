"use client"

import { useState } from "react"
import { ArticleCard } from "./article-card"
import type { Article } from "@/lib/types"

export function LoadMoreGrid({ initialArticles, initialOffset = 12 }: { initialArticles: Article[]; initialOffset?: number }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [offset, setOffset] = useState(initialOffset)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialArticles.length >= 12)

  const loadMore = async () => {
    setLoading(true)
    const res = await fetch(`/api/articles?offset=${offset}&limit=12`)
    const data = await res.json()

    const normalized = data.map((row: any) => ({
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      cover_image_url: row.cover_image_url,
      published_at: row.published_at,
      source_name: row.source_name,
      category: Array.isArray(row.categories) ? row.categories[0] || null : row.categories,
    }))

    setArticles((prev) => [...prev, ...normalized])
    setOffset((prev) => prev + 12)
    setHasMore(data.length >= 12)
    setLoading(false)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white border-2 border-brand-lavanda text-brand-lavanda font-headline uppercase text-sm rounded-lg hover:bg-brand-lavanda hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Carregar Mais Notícias"}
          </button>
        </div>
      )}
    </div>
  )
}
