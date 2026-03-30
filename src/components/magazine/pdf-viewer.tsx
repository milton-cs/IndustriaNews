"use client"

import { useState, useCallback, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export function PdfViewer({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [containerWidth, setContainerWidth] = useState(800)

  useEffect(() => {
    const updateWidth = () => {
      const w = Math.min(window.innerWidth - 32, 900)
      setContainerWidth(w)
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }

  const goTo = useCallback((page: number) => {
    if (page < 1 || page > numPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [numPages])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(currentPage - 1)
      if (e.key === "ArrowRight") goTo(currentPage + 1)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [currentPage, goTo])

  return (
    <div>
      {/* Navigation top */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30"
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-headline hidden sm:inline">{title}</span>
          <span className="text-sm text-gray-400 mx-2 hidden sm:inline">·</span>
          <span className="text-sm font-headline text-brand-lavanda">
            Página {currentPage} de {numPages || "..."}
          </span>
        </div>
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= numPages}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30"
        >
          Próxima →
        </button>
      </div>

      {/* PDF Page */}
      <div className="flex justify-center">
        <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
          {loading && (
            <div className="flex items-center justify-center py-32 px-16">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-brand-lavanda/30 border-t-brand-lavanda rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-headline text-sm uppercase">Carregando revista...</p>
              </div>
            </div>
          )}
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading=""
            error={
              <div className="p-16 text-center">
                <p className="text-red-400 font-headline">Erro ao carregar a revista</p>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-brand-lavanda underline text-sm mt-2 block">
                  Abrir PDF diretamente
                </a>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={containerWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading=""
            />
          </Document>
        </div>
      </div>

      {/* Navigation bottom */}
      <div className="flex items-center justify-between mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30"
        >
          ← Anterior
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Ir para:</span>
          <input
            type="number"
            min={1}
            max={numPages}
            value={currentPage}
            onChange={(e) => goTo(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 text-center text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50"
          />
          <span className="text-sm text-gray-400">de {numPages}</span>
        </div>
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= numPages}
          className="px-4 py-2 text-sm font-headline uppercase bg-white border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30"
        >
          Próxima →
        </button>
      </div>
    </div>
  )
}
