import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-brand-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Image
              src="/logo.png"
              alt="Indústria News"
              width={100}
              height={50}
              className="h-12 w-auto mb-4 brightness-200"
            />
            <p className="text-gray-400 text-sm max-w-xs">
              O portal de notícias e inteligência para o setor industrial brasileiro.
            </p>
          </div>
          <div className="text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Indústria News</p>
            <p>Revista Segmentada e Publicidade LTDA</p>
            <p>Av. Paulista, 1636 — São Paulo, SP</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
