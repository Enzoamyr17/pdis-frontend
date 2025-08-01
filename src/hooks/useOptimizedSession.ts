"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import type { Session } from "next-auth"

const SESSION_CACHE_KEY = 'nextauth_session_cache'
const SESSION_CACHE_EXPIRY_KEY = 'nextauth_session_cache_expiry'
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes in milliseconds

interface CachedSession {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
}

export function useOptimizedSession() {
  const { data: session, status } = useSession()
  const [cachedSession, setCachedSession] = useState<CachedSession | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Get cached session data
  const getCachedSession = (): CachedSession | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cachedData = sessionStorage.getItem(SESSION_CACHE_KEY)
      const cacheExpiry = sessionStorage.getItem(SESSION_CACHE_EXPIRY_KEY)
      
      if (cachedData && cacheExpiry) {
        const isExpired = Date.now() > parseInt(cacheExpiry)
        if (!isExpired) {
          return JSON.parse(cachedData)
        } else {
          // Clear expired cache
          sessionStorage.removeItem(SESSION_CACHE_KEY)
          sessionStorage.removeItem(SESSION_CACHE_EXPIRY_KEY)
        }
      }
    } catch (error) {
      console.error('Error reading session cache:', error)
    }
    return null
  }

  // Set cached session data
  const setCachedSessionData = (sessionData: CachedSession) => {
    if (typeof window === 'undefined') return
    
    try {
      const expiryTime = Date.now() + CACHE_DURATION
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(sessionData))
      sessionStorage.setItem(SESSION_CACHE_EXPIRY_KEY, expiryTime.toString())
    } catch (error) {
      console.error('Error writing session cache:', error)
    }
  }

  // Initialize with cached data if available
  useEffect(() => {
    if (!isInitialized) {
      const cached = getCachedSession()
      if (cached && status === 'loading') {
        setCachedSession(cached)
      }
      setIsInitialized(true)
    }
  }, [isInitialized, status])

  // Update cache when session changes
  useEffect(() => {
    if (status !== 'loading') {
      const sessionData: CachedSession = { session, status }
      setCachedSession(sessionData)
      setCachedSessionData(sessionData)
    }
  }, [session, status])

  // Return cached session if available and current session is loading
  if (cachedSession && status === 'loading') {
    return {
      data: cachedSession.session,
      status: cachedSession.status,
      isCached: true
    }
  }

  return {
    data: session,
    status,
    isCached: false
  }
}

// Export function to clear session cache
export const clearSessionCache = () => {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY)
    sessionStorage.removeItem(SESSION_CACHE_EXPIRY_KEY)
  } catch (error) {
    console.error('Error clearing session cache:', error)
  }
}