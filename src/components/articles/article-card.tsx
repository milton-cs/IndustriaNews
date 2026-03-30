import Link from "next/link"
import Image from "next/image"
import type { Article } from "@/lib/types"

const categoryGradients: Record<string, string> = {
  "Minera\u00e7\u00e3o": "from-amber-900 to-amber-700",
  "Automotivo": "from-blue-900 to-blue-700",
  "Energia El\u00e9trica": "from-yellow-800 to-yellow-600",
  "Metalurgia e Siderurgia": "from-gray-800 to-gray-600",
  "Alimentos e Bebidas": "from-green-900 to-green-700",
  "Qu\u00edmica e Petroqu\u00edmica": "from-purple-900 to-purple-700",
  "Ind\u00fastria 4.0": "from-cyan-900 to-cyan-700",
  "ESG e Sustentabilidade": "from-emerald-900 to-emerald-700",
  "Petr\u00f3leo e G\u00e1s": "from-orange-900 to-orange-700",
  "Farmac\u00eautica e Cosm\u00e9ticos": "from-pink-900 to-pink-700",
  "Defesa e Aeroespacial": "from-slate-800 to-slate-600",
  "Infraestrutura": "from-stone-800 to-stone-600",
}

function getGradient(categoryName: string | undefined): string {
  if (!categoryName) return "from-brand-grafite to-brand-grafite-light"
  return categoryGradients[categoryName] || "from-brand-grafite to-brand-grafite-light"
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/noticia/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getGradient(article.category?.name)} flex items-center justify-center`}>
              <span className="font-headline text-white/30 text-4xl font-black tracking-tighter select-none">IN</span>
            </div>
          )}
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
          {article.published_at && (
            <time className="text-xs text-gray-400 mt-3 block">
              {new Date(article.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
            </time>
          )}
        </div>
      </article>
    </Link>
  )
}
