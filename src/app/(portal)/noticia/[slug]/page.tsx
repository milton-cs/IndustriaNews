import { createClient } from "@/lib/supabase/server"
import { ArticleContent } from "@/components/articles/article-content"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("articles")
    .select("title, seo_title, seo_description, excerpt, cover_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!data) return {}

  return {
    title: data.seo_title || data.title,
    description: data.seo_description || data.excerpt,
    openGraph: { images: data.cover_image_url ? [data.cover_image_url] : [] },
  }
}

export const revalidate = 300

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, content, excerpt, cover_image_url, published_at, source_name, categories(name, slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!article) notFound()

  const category = Array.isArray(article.categories) ? article.categories[0] : article.categories

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {category && (
        <span className="inline-block mb-4 px-2 py-0.5 rounded-full bg-brand-lavanda/10 text-brand-lavanda font-headline text-xs uppercase tracking-wide">
          {category.name}
        </span>
      )}
      <h1 className="font-headline text-3xl md:text-5xl font-black leading-tight mb-4">
        {article.title}
      </h1>
      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        {article.published_at && (
          <time>{new Date(article.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</time>
        )}
        {article.source_name && <span>Fonte: {article.source_name}</span>}
      </div>
      <ArticleContent content={article.content} articleId={article.id} />
    </article>
  )
}
