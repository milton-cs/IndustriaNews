"use client"

import { useState } from "react"

export function PdfViewer({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <span className="font-headline text-sm text-brand-lavanda uppercase tracking-wide">{title}</span>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-headline uppercase bg-brand-lavanda text-white rounded-lg hover:bg-brand-lavanda-dark transition-colors"
        >
          Abrir em Nova Aba
        </a>
      </div>

      {/* PDF Viewer */}
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100" style={{ height: "85vh" }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-brand-lavanda/30 border-t-brand-lavanda rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 font-headline text-sm uppercase">Carregando revista...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
          className="w-full h-full border-0"
          title={title}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Footer info */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Use os controles do leitor para navegar entre as páginas. Em dispositivos móveis, use gestos de pinça para zoom.
      </p>
    </div>
  )
}
