"use client"

import { useState, useCallback, useEffect } from "react"

type MagazinePage = {
  id: string
  page_number: number
  type: string
  content: string | null
  image_url: string | null
}

type Edition = {
  title: string
  edition_number: number | null
  year: number | null
  month: number | null
}

export function MagazineViewer({ pages, edition }: { pages: MagazinePage[]; edition: Edition }) {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)

  const total = pages.length
  const page = pages[current]

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= total) return
    setFade(false)
    setTimeout(() => {
      setCurrent(index)
      setFade(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 150)
  }, [total])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(current - 1)
      if (e.key === "ArrowRight") goTo(current + 1)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [current, goTo])

  if (!page) return <p className="text-gray-400 text-center py-16">Sem conteúdo.</p>

  return (
    <div>
      {/* Page indicator + nav (top) */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-500 font-headline">
          Página {current + 1} de {total}
        </span>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === total - 1}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
        >
          Próxima →
        </button>
      </div>

      {/* Page content */}
      <div className={`transition-opacity duration-200 ${fade ? "opacity-100" : "opacity-0"}`}>
        {page.image_url && (
          <img src={page.image_url} alt={`Página ${page.page_number}`} className="w-full rounded-xl shadow-lg mb-8" />
        )}
        {page.content && (
          <div className="prose prose-lg max-w-none leading-relaxed">
            {page.content.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="mb-4 text-gray-700 leading-relaxed">{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Page indicator + nav (bottom) */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Ir para:</span>
          <input
            type="number"
            min={1}
            max={total}
            value={current + 1}
            onChange={(e) => goTo(parseInt(e.target.value) - 1)}
            className="w-16 px-2 py-1 text-center text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
          />
          <span className="text-sm text-gray-400">de {total}</span>
        </div>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === total - 1}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-200"
        >
          Próxima →
        </button>
      </div>
    </div>
  )
}
