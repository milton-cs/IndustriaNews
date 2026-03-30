export type ArticleRow = {
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  categories: { name: string; slug: string }[] | { name: string; slug: string } | null
}

export type Article = {
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  category: { name: string; slug: string } | null
}

export function normalizeArticle(row: ArticleRow): Article {
  let category: Article["category"] = null
  if (Array.isArray(row.categories)) {
    category = row.categories[0] || null
  } else if (row.categories) {
    category = row.categories
  }
  return {
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    cover_image_url: row.cover_image_url,
    published_at: row.published_at,
    category,
  }
}
