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
  const renderedRef = useRef(false)

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || renderedRef.current) return
    renderedRef.current = true

    pdfDoc.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale: 1 })
      const scale = Math.min(width / viewport.width, height / viewport.height)
      const sv = page.getViewport({ scale })
      const canvas = canvasRef.current!
      canvas.width = sv.width
      canvas.height = sv.height
      page.render({ canvasContext: canvas.getContext("2d")!, viewport: sv })
    }).catch(() => {})
  }, [pdfDoc, pageNum, width, height])

  return (
    <div ref={ref} className="bg-white flex items-center justify-center" style={{ width, height }}>
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
  const [dims, setDims] = useState({ w: 500, h: 680 })
  const containerRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<any>(null)

  // Base dimensions (fixed, never change after mount)
  useEffect(() => {
    const vw = Math.min(window.innerWidth - 48, 1200)
    const pw = vw > 768 ? Math.floor(vw / 2) : vw - 16
    setDims({ w: pw, h: Math.floor(pw * 1.35) })
  }, [])

  // Load PDF
  useEffect(() => {
    pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    }).promise.then((doc) => {
      setPdfDoc(doc)
      setNumPages(doc.numPages)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [pdfUrl])

  const onFlip = useCallback((e: any) => setCurrentPage(e.data), [])
  const goNext = () => flipRef.current?.pageFlip()?.flipNext()
  const goPrev = () => flipRef.current?.pageFlip()?.flipPrev()

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 0.25, 2))
      if (e.key === "-") setZoom(z => Math.max(z - 0.25, 0.5))
      if (e.key === "f" || e.key === "F") toggleFullscreen()
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  })

  // Fullscreen
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", h)
    return () => document.removeEventListener("fullscreenchange", h)
  }, [])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await containerRef.current.requestFullscreen()
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: `Revista ${title}`, url })
    } else {
      await navigator.clipboard.writeText(url)
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
        </div>
      </div>
    )
  }

  if (!pdfDoc) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Não foi possível carregar.</p>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 bg-brand-lavanda text-white font-headline uppercase rounded-lg">
          Abrir PDF
        </a>
      </div>
    )
  }

  const fs = isFullscreen
  const btnClass = `w-9 h-9 flex items-center justify-center rounded-lg text-base transition-colors ${fs ? "text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`

  return (
    <div ref={containerRef} className={fs ? "bg-gray-900 h-screen flex flex-col" : ""}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2 rounded-xl shadow-sm border ${fs ? "bg-gray-800 border-gray-700 mx-4 mt-4" : "bg-white border-gray-100 mb-3"}`}>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} disabled={currentPage <= 0} className={`${btnClass} disabled:opacity-20`}>←</button>
          <span className={`text-sm font-headline min-w-[4rem] text-center ${fs ? "text-brand-lavanda-light" : "text-brand-lavanda"}`}>
            {currentPage + 1} / {numPages}
          </span>
          <button onClick={goNext} disabled={currentPage >= numPages - 1} className={`${btnClass} disabled:opacity-20`}>→</button>
        </div>

        <div className="flex items-center gap-0.5">
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} className={btnClass} title="Diminuir">−</button>
          <button onClick={() => setZoom(1)} className={`text-xs font-headline min-w-[3rem] text-center py-1 rounded-lg transition-colors ${fs ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 2))} className={btnClass} title="Ampliar">+</button>
        </div>

        <div className="flex items-center gap-0.5">
          <button onClick={toggleFullscreen} className={btnClass} title="Tela Cheia (F)">
            {fs ? "✕" : "⛶"}
          </button>
          <button onClick={handleShare} className={`${btnClass} ${copied ? "!text-green-400" : ""}`} title="Compartilhar">
            {copied ? "✓" : "↗"}
          </button>
          <a href={pdfUrl} download target="_blank" rel="noopener noreferrer" className={btnClass} title="Baixar PDF">
            ↓
          </a>
        </div>
      </div>

      {/* Flipbook area — zoom via CSS transform (no re-render) */}
      <div className={`flex items-center justify-center overflow-auto rounded-2xl ${fs ? "bg-gray-800 flex-1 mx-4 mb-2" : "bg-gray-100 p-2 md:p-4 shadow-inner"}`}>
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s ease" }}
        >
          {/* @ts-ignore */}
          <HTMLFlipBook
            ref={flipRef}
            width={dims.w}
            height={dims.h}
            size="stretch"
            minWidth={280}
            maxWidth={650}
            minHeight={380}
            maxHeight={880}
            showCover={true}
            onFlip={onFlip}
            className="shadow-2xl"
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={500}
            usePortrait={typeof window !== "undefined" && window.innerWidth < 768}
            startZIndex={0}
            autoSize={true}
            maxShadowOpacity={0.4}
            mobileScrollSupport={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage key={i} pageNum={i + 1} pdfDoc={pdfDoc} width={dims.w} height={dims.h} />
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <p className={`text-center text-[11px] py-2 ${fs ? "text-gray-600" : "text-gray-400"}`}>
        Bordas para virar · Setas ← → · +/- zoom · F tela cheia · Arraste para folhear
      </p>
    </div>
  )
}
