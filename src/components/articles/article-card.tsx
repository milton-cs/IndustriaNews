import Link from "next/link"
import type { Article } from "@/lib/types"
import { ArticleImage } from "./article-image"

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/noticia/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden">
          <ArticleImage
            src={article.cover_image_url}
            alt={article.title}
            categoryName={article.category?.name}
          />
        </div>
        <div className="p-4 sm:p-5">
          {article.category && (
            <span className="inline-block mb-2 px-2.5 py-1 rounded-full bg-brand-lavanda/10 text-brand-lavanda font-headline text-[10px] uppercase tracking-wider">
              {article.category.name}
            </span>
          )}
          <h3 className="font-headline text-base sm:text-lg font-bold leading-tight mb-2 group-hover:text-brand-lavanda transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            {article.published_at && (
              <time>
                {new Date(article.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
              </time>
            )}
            {article.source_name && (
              <span className="before:content-['·'] before:mr-2">
                {article.source_name}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
