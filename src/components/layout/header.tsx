"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-brand-offwhite/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo-positiva.png"
            alt="Indústria News"
            width={120}
            height={60}
            className="h-12 sm:h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/revista" className="font-headline text-sm uppercase tracking-wide px-4 py-2 bg-brand-lavanda/10 text-brand-lavanda border border-brand-lavanda/30 rounded-lg hover:bg-brand-lavanda hover:text-white transition-all">
            Revista
          </Link>
          <Link href="/sobre" className="font-headline text-sm uppercase tracking-wide text-gray-600 hover:text-brand-lavanda transition-colors">
            Sobre
          </Link>
          <Link href="/login" className="font-headline text-xs uppercase tracking-wide px-4 py-2 bg-brand-lavanda text-white rounded-lg hover:bg-brand-lavanda-dark transition-colors">
            &Aacute;rea do Anunciante
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-brand-black transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-brand-black transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-brand-black transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link href="/revista" onClick={() => setMenuOpen(false)} className="block font-headline text-sm uppercase tracking-wide text-brand-lavanda border border-brand-lavanda/30 rounded-lg px-4 py-2 text-center hover:bg-brand-lavanda hover:text-white transition-all">
            Revista
          </Link>
          <Link href="/sobre" onClick={() => setMenuOpen(false)} className="block font-headline text-sm uppercase tracking-wide text-gray-600 hover:text-brand-lavanda py-2">
            Sobre
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="block font-headline text-sm uppercase tracking-wide text-center px-4 py-3 bg-brand-lavanda text-white rounded-lg">
            &Aacute;rea do Anunciante
          </Link>
        </nav>
      )}
    </header>
  )
}
