import Link from "next/link"
import { ArticleCard } from "./article-card"
import type { Article } from "@/lib/types"

export function CategorySection({ name, slug, articles }: { name: string; slug: string; articles: Article[] }) {
  if (articles.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-xl font-bold border-b-2 border-brand-lavanda pb-2">
          {name}
        </h2>
        <Link href={`/categoria/${slug}`} className="text-sm text-brand-lavanda font-headline uppercase hover:text-brand-lavanda-dark transition-colors">
          Ver Todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  )
}
