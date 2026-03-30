"use client"

import { useState, useEffect, useRef, useCallback, forwardRef } from "react"
import HTMLFlipBook from "react-pageflip"
import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

type PageProps = {
  pageNum: number
  pdfDoc: pdfjsLib.PDFDocumentProxy | null
  width: number
  height: number
}

const PdfPage = forwardRef<HTMLDivElement, PageProps>(({ pageNum, pdfDoc, width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || rendered) return

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1 })
        const scale = Math.min(width / viewport.width, height / viewport.height)
        const scaledViewport = page.getViewport({ scale })

        const canvas = canvasRef.current!
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height

        await page.render({
          canvasContext: canvas.getContext("2d")!,
          viewport: scaledViewport,
        }).promise

        setRendered(true)
      } catch {}
    }

    renderPage()
  }, [pdfDoc, pageNum, width, height, rendered])

  return (
    <div ref={ref} className="bg-white flex items-center justify-center" style={{ width, height }}>
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-6 h-6 border-2 border-brand-lavanda/30 border-t-brand-lavanda rounded-full animate-spin" />
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  )
})
PdfPage.displayName = "PdfPage"

export function PdfViewer({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 })
  const containerRef = useRef<HTMLDivElement>(null)
  const flipBookRef = useRef<any>(null)

  // Responsive dimensions
  useEffect(() => {
    const updateSize = () => {
      const w = Math.min(window.innerWidth - 48, 1200)
      const pageW = w > 768 ? Math.floor(w / 2) : w - 16
      const pageH = Math.floor(pageW * 1.35)
      setDimensions({ width: pageW, height: pageH })
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const doc = await pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        }).promise
        setPdfDoc(doc)
        setNumPages(doc.numPages)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    loadPdf()
  }, [pdfUrl])

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data)
  }, [])

  const goNext = () => flipBookRef.current?.pageFlip()?.flipNext()
  const goPrev = () => flipBookRef.current?.pageFlip()?.flipPrev()

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-lavanda/30 border-t-brand-lavanda rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-headline text-sm uppercase">Carregando revista...</p>
          <p className="text-gray-300 text-xs mt-2">130 páginas · pode levar alguns segundos</p>
        </div>
      </div>
    )
  }

  if (!pdfDoc) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Não foi possível carregar a revista.</p>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 bg-brand-lavanda text-white font-headline uppercase rounded-lg hover:bg-brand-lavanda-dark transition-colors">
          Abrir PDF Diretamente
        </a>
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      {/* Controls top */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
        <button onClick={goPrev} disabled={currentPage <= 0}
          className="px-4 py-2 text-sm font-headline uppercase border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30">
          ← Anterior
        </button>
        <span className="text-sm font-headline text-brand-lavanda">
          Página {currentPage + 1} de {numPages}
        </span>
        <button onClick={goNext} disabled={currentPage >= numPages - 1}
          className="px-4 py-2 text-sm font-headline uppercase border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30">
          Próxima →
        </button>
      </div>

      {/* Flipbook */}
      <div className="flex justify-center bg-gray-100 rounded-2xl p-4 md:p-8 shadow-inner">
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={flipBookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="stretch"
          minWidth={300}
          maxWidth={600}
          minHeight={420}
          maxHeight={840}
          showCover={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={window.innerWidth < 768}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <PdfPage
              key={i}
              pageNum={i + 1}
              pdfDoc={pdfDoc}
              width={dimensions.width}
              height={dimensions.height}
            />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Controls bottom */}
      <div className="flex items-center justify-between mt-4 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
        <button onClick={goPrev} disabled={currentPage <= 0}
          className="px-4 py-2 text-sm font-headline uppercase border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30">
          ← Anterior
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Ir para:</span>
          <input type="number" min={1} max={numPages} value={currentPage + 1}
            onChange={(e) => flipBookRef.current?.pageFlip()?.flip(parseInt(e.target.value) - 1)}
            className="w-14 px-2 py-1 text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-lavanda/50" />
          <span className="text-gray-400">de {numPages}</span>
        </div>
        <button onClick={goNext} disabled={currentPage >= numPages - 1}
          className="px-4 py-2 text-sm font-headline uppercase border border-gray-200 rounded-lg hover:bg-brand-lavanda hover:text-white hover:border-brand-lavanda transition-all disabled:opacity-30">
          Próxima →
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Clique nas bordas da página ou arraste para virar. Use as setas ← → do teclado.
      </p>
    </div>
  )
}
