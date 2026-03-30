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
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 })
  const containerRef = useRef<HTMLDivElement>(null)
  const flipBookRef = useRef<any>(null)

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

  const onFlip = useCallback((e: any) => setCurrentPage(e.data), [])
  const goNext = () => flipBookRef.current?.pageFlip()?.flipNext()
  const goPrev = () => flipBookRef.current?.pageFlip()?.flipPrev()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 0.25, 2))
      if (e.key === "-") setZoom(z => Math.max(z - 0.25, 0.75))
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  // Fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await containerRef.current.requestFullscreen()
    }
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Revista ${title}`, url: shareUrl })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-lavanda/30 border-t-brand-lavanda rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-headline text-sm uppercase">Carregando revista...</p>
          <p className="text-gray-300 text-xs mt-2">130 páginas</p>
        </div>
      </div>
    )
  }

  if (!pdfDoc) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Não foi possível carregar a revista.</p>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 bg-brand-lavanda text-white font-headline uppercase rounded-lg">
          Abrir PDF Diretamente
        </a>
      </div>
    )
  }

  const zoomedW = Math.floor(dimensions.width * zoom)
  const zoomedH = Math.floor(dimensions.height * zoom)

  return (
    <div ref={containerRef} className={isFullscreen ? "bg-gray-900 p-4 h-screen flex flex-col" : ""}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between mb-3 rounded-xl px-4 py-2.5 shadow-sm border ${isFullscreen ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {/* Left: nav */}
        <div className="flex items-center gap-2">
          <button onClick={goPrev} disabled={currentPage <= 0}
            className={`px-3 py-1.5 text-xs font-headline uppercase border rounded-lg transition-all disabled:opacity-30 ${isFullscreen ? "border-gray-600 text-gray-300 hover:bg-brand-lavanda hover:text-white" : "border-gray-200 hover:bg-brand-lavanda hover:text-white"}`}>
            ←
          </button>
          <span className={`text-sm font-headline ${isFullscreen ? "text-brand-lavanda-light" : "text-brand-lavanda"}`}>
            {currentPage + 1} / {numPages}
          </span>
          <button onClick={goNext} disabled={currentPage >= numPages - 1}
            className={`px-3 py-1.5 text-xs font-headline uppercase border rounded-lg transition-all disabled:opacity-30 ${isFullscreen ? "border-gray-600 text-gray-300 hover:bg-brand-lavanda hover:text-white" : "border-gray-200 hover:bg-brand-lavanda hover:text-white"}`}>
            →
          </button>
        </div>

        {/* Center: zoom */}
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.75))}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${isFullscreen ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            −
          </button>
          <span className={`text-xs font-headline min-w-[3rem] text-center ${isFullscreen ? "text-gray-400" : "text-gray-500"}`}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 2))}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${isFullscreen ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            +
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <button onClick={toggleFullscreen} title="Tela Cheia"
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${isFullscreen ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            {isFullscreen ? "✕" : "⛶"}
          </button>
          <button onClick={handleShare} title={copied ? "Link copiado!" : "Compartilhar"}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${copied ? "text-green-400" : isFullscreen ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            {copied ? "✓" : "↗"}
          </button>
          <a href={pdfUrl} download title="Baixar PDF" target="_blank" rel="noopener noreferrer"
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${isFullscreen ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            ↓
          </a>
        </div>
      </div>

      {/* Flipbook */}
      <div className={`flex justify-center rounded-2xl p-2 md:p-6 shadow-inner overflow-auto ${isFullscreen ? "bg-gray-800 flex-1" : "bg-gray-100"}`}>
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={flipBookRef}
          width={zoomedW}
          height={zoomedH}
          size="stretch"
          minWidth={280}
          maxWidth={700}
          minHeight={400}
          maxHeight={950}
          showCover={true}
          onFlip={onFlip}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={typeof window !== "undefined" && window.innerWidth < 768}
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
            <PdfPage key={i} pageNum={i + 1} pdfDoc={pdfDoc} width={zoomedW} height={zoomedH} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Footer hint */}
      <p className={`text-center text-xs mt-3 ${isFullscreen ? "text-gray-500" : "text-gray-400"}`}>
        Clique nas bordas para virar · Setas ← → · Teclas +/- para zoom · Arraste para folhear
      </p>
    </div>
  )
}
