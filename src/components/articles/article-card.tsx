import Link from "next/link"
import Image from "next/image"
import type { Article } from "@/lib/types"

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/noticia/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
        {article.cover_image_url && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          {article.category && (
            <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-brand-lavanda/10 text-brand-lavanda font-headline text-[10px] uppercase tracking-wide">
              {article.category.name}
            </span>
          )}
          <h3 className="font-headline text-lg font-bold leading-tight mb-2 group-hover:text-brand-lavanda transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
          )}
          {article.published_at && (
            <time className="text-xs text-gray-400 mt-2 block">
              {new Date(article.published_at).toLocaleDateString("pt-BR")}
            </time>
          )}
        </div>
      </article>
    </Link>
  )
}
