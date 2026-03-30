export function generateSessionId(): string {
  return crypto.randomUUID()
}

export function parseReaderId(request: Request): string | null {
  const cookies = request.headers.get("cookie") || ""
  const match = cookies.match(/reader_id=([^;]+)/)
  if (match) return match[1]

  const url = new URL(request.url)
  return url.searchParams.get("uid")
}
