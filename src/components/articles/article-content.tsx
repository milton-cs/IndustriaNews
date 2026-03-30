"use client"

import { useState, useEffect } from "react"
import { ContentGate } from "@/components/gate/content-gate"

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? match[2] : null
}

export function ArticleContent({
  content,
  articleId,
  gateAfterParagraphs = 3,
}: {
  content: string
  articleId: string
  gateAfterParagraphs?: number
}) {
  const [isGated, setIsGated] = useState(false)
  const [showGate, setShowGate] = useState(false)

  const paragraphs = content.split("\n").filter((p) => p.trim())
  const previewContent = paragraphs.slice(0, gateAfterParagraphs).join("\n\n")
  const fullContent = paragraphs.join("\n\n")

  useEffect(() => {
    const readerId = getCookie("reader_id")
    const urlParams = new URLSearchParams(window.location.search)
    const uid = urlParams.get("uid")

    if (readerId || uid) {
      setIsGated(false)
    } else if (paragraphs.length > gateAfterParagraphs) {
      setIsGated(true)
      const timer = setTimeout(() => setShowGate(true), 500)
      return () => clearTimeout(timer)
    }
  }, [paragraphs.length, gateAfterParagraphs])

  const handleGateSubmit = async (data: {
    name: string; company: string; position: string; email: string; phone: string
  }) => {
    const res = await fetch("/api/gate/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, articleId }),
    })

    if (res.ok) {
      setIsGated(false)
      setShowGate(false)
    }
  }

  return (
    <>
      <div className="prose prose-lg max-w-none">
        {(isGated ? previewContent : fullContent).split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {isGated && (
        <div className="relative mt-4">
          <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-brand-offwhite to-transparent" />
        </div>
      )}
      {showGate && <ContentGate onSubmit={handleGateSubmit} />}
    </>
  )
}
