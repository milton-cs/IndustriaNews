"use client"

import { useState } from "react"
import Image from "next/image"

const categoryGradients: Record<string, string> = {
  "Mineração": "from-amber-900 to-amber-700",
  "Automotivo": "from-blue-900 to-blue-700",
  "Energia Elétrica": "from-yellow-800 to-yellow-600",
  "Metalurgia e Siderurgia": "from-gray-800 to-gray-600",
  "Alimentos e Bebidas": "from-green-900 to-green-700",
  "Química e Petroquímica": "from-purple-900 to-purple-700",
  "Indústria 4.0": "from-cyan-900 to-cyan-700",
  "ESG e Sustentabilidade": "from-emerald-900 to-emerald-700",
  "Petróleo e Gás": "from-orange-900 to-orange-700",
  "Farmacêutica e Cosméticos": "from-pink-900 to-pink-700",
  "Defesa e Aeroespacial": "from-slate-800 to-slate-600",
  "Infraestrutura": "from-stone-800 to-stone-600",
}

function getGradient(categoryName: string | undefined): string {
  if (!categoryName) return "from-brand-grafite to-brand-grafite-light"
  return categoryGradients[categoryName] || "from-brand-grafite to-brand-grafite-light"
}

function Placeholder({ categoryName }: { categoryName?: string }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${getGradient(categoryName)} flex items-center justify-center`}>
      <span className="font-headline text-white/30 text-4xl font-black tracking-tighter select-none">IN</span>
    </div>
  )
}

export function ArticleImage({
  src,
  alt,
  categoryName,
  priority = false,
}: {
  src: string | null
  alt: string
  categoryName?: string
  priority?: boolean
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return <Placeholder categoryName={categoryName} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
      priority={priority}
      unoptimized
    />
  )
}
