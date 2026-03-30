"use client"

import { createContext, useContext, useEffect, useRef } from "react"

type TrackingContext = {
  track: (event: {
    event_type: string
    article_id?: string
    campaign_id?: string
    advertiser_id?: string
    metadata?: Record<string, unknown>
  }) => void
}

const TrackerContext = createContext<TrackingContext>({
  track: () => {},
})

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const sessionId = useRef<string>("")

  useEffect(() => {
    sessionId.current = crypto.randomUUID()
  }, [])

  const track: TrackingContext["track"] = (event) => {
    navigator.sendBeacon(
      "/api/tracking",
      JSON.stringify({ ...event, session_id: sessionId.current })
    )
  }

  return (
    <TrackerContext.Provider value={{ track }}>
      {children}
    </TrackerContext.Provider>
  )
}

export function useTracker() {
  return useContext(TrackerContext)
}
