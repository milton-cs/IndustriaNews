"use client"

import { useState, useEffect } from "react"

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-black/95 backdrop-blur-sm border-t border-white/10 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300 text-center md:text-left">
          Utilizamos cookies para melhorar sua experiência e personalizar conteúdo.
          Ao continuar navegando, você concorda com nossa{" "}
          <a href="/privacidade" className="text-brand-lavanda underline">Política de Privacidade</a>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={accept}
            className="px-6 py-2 bg-brand-lavanda hover:bg-brand-lavanda-dark text-white text-sm font-headline uppercase rounded-lg transition-colors"
          >
            Aceitar
          </button>
          <button
            onClick={accept}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-headline uppercase rounded-lg transition-colors"
          >
            Apenas Essenciais
          </button>
        </div>
      </div>
    </div>
  )
}
