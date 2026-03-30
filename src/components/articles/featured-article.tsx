import Link from "next/link"
import Image from "next/image"
import type { Article } from "@/lib/types"

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link href={`/noticia/${article.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-xl bg-brand-black aspect-[21/9] md:aspect-[3/1]">
        {article.cover_image_url && (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          {article.category && (
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-brand-lavanda text-white font-headline text-xs uppercase">
              {article.category.name}
            </span>
          )}
          <h2 className="font-headline text-2xl md:text-4xl font-black text-white leading-tight mb-2">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-white/70 text-sm md:text-base max-w-2xl">{article.excerpt}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
