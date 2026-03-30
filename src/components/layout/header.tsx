import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand-offwhite/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <span className="font-headline text-2xl font-bold text-brand-lavanda tracking-tighter">
              INDÚSTRIA
            </span>
            <span className="font-headline text-3xl font-black text-brand-black tracking-tighter -mt-1">
              NEWS
            </span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/revista" className="font-headline text-sm uppercase tracking-wide text-gray-600 hover:text-brand-lavanda transition-colors">
            Revista
          </Link>
          <Link href="/sobre" className="font-headline text-sm uppercase tracking-wide text-gray-600 hover:text-brand-lavanda transition-colors">
            Sobre
          </Link>
        </nav>
      </div>
    </header>
  )
}
