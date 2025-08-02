"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"

interface CacheOptions {
  duration?: number // Duration in milliseconds
  storage?: 'sessionStorage' | 'localStorage'
  keyPrefix?: string
}

interface CachedData<T> {
  data: T
  timestamp: number
  expiry: number
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const DEFAULT_STORAGE = 'sessionStorage'

export function useApiCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const {
    duration = DEFAULT_CACHE_DURATION,
    storage = DEFAULT_STORAGE,
    keyPrefix = 'pdis_api_cache',
    enabled = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Memoize stable values to prevent re-renders
  const stableOptions = useMemo(() => ({
    duration,
    storage,
    keyPrefix,
    fullCacheKey: `${keyPrefix}_${cacheKey}`,
    storageApi: typeof window !== 'undefined' ? window[storage] : null
  }), [duration, storage, keyPrefix, cacheKey])

  // Use ref to store the fetcher to avoid dependency issues
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  // Get cached data
  const getCachedData = useCallback((): T | null => {
    if (!stableOptions.storageApi) return null

    try {
      const cachedItem = stableOptions.storageApi.getItem(stableOptions.fullCacheKey)
      if (!cachedItem) return null

      const cached: CachedData<T> = JSON.parse(cachedItem)
      const now = Date.now()

      if (now > cached.expiry) {
        // Cache expired, remove it
        stableOptions.storageApi.removeItem(stableOptions.fullCacheKey)
        return null
      }

      return cached.data
    } catch (error) {
      console.error('Error reading from cache:', error)
      return null
    }
  }, [stableOptions])

  // Set cached data
  const setCachedData = useCallback((data: T) => {
    if (!stableOptions.storageApi) return

    try {
      const now = Date.now()
      const cached: CachedData<T> = {
        data,
        timestamp: now,
        expiry: now + stableOptions.duration
      }
      stableOptions.storageApi.setItem(stableOptions.fullCacheKey, JSON.stringify(cached))
    } catch (error) {
      console.error('Error writing to cache:', error)
    }
  }, [stableOptions])

  // Clear cached data
  const clearCache = useCallback(() => {
    if (!stableOptions.storageApi) return

    try {
      stableOptions.storageApi.removeItem(stableOptions.fullCacheKey)
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }, [stableOptions])

  // Fetch data with caching
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first (unless forced refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData()
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          return cachedData
        }
      }

      // Fetch fresh data
      const freshData = await fetcherRef.current()
      setData(freshData)
      setCachedData(freshData)
      return freshData
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      console.error('Error fetching data:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [getCachedData, setCachedData])

  // Initialize data on mount only once
  useEffect(() => {
    if (!initialized && enabled) {
      setInitialized(true)
      // Call fetchData without dependencies to prevent infinite loops
      const initFetch = async () => {
        try {
          setLoading(true)
          setError(null)

          // Check cache first
          const cachedData = getCachedData()
          if (cachedData) {
            setData(cachedData)
            setLoading(false)
            return
          }

          // Fetch fresh data
          const freshData = await fetcherRef.current()
          setData(freshData)
          setCachedData(freshData)
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(error)
          // Don't show 'Session loading' as an error to user
          if (!error.message.includes('Session loading')) {
            console.error('Error fetching data:', error)
          }
        } finally {
          setLoading(false)
        }
      }
      
      initFetch()
    } else if (!enabled) {
      setLoading(false)
      setData(null)
      setError(null)
    }
  }, [initialized, getCachedData, setCachedData, enabled])

  // Refresh data manually
  const refresh = useCallback(() => fetchData(true), [fetchData])

  // Check if data is from cache
  const isFromCache = useCallback(() => {
    return getCachedData() !== null
  }, [getCachedData])

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache: isFromCache()
  }
}

// Utility function to clear all caches with a specific prefix
export const clearAllApiCaches = (keyPrefix = 'pdis_api_cache', storage: 'sessionStorage' | 'localStorage' = 'sessionStorage') => {
  if (typeof window === 'undefined') return

  try {
    const storageApi = window[storage]
    const keys = Object.keys(storageApi)
    
    keys.forEach(key => {
      if (key.startsWith(keyPrefix)) {
        storageApi.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing all caches:', error)
  }
}

// Utility function to get cache info
export const getCacheInfo = (cacheKey: string, keyPrefix = 'pdis_api_cache', storage: 'sessionStorage' | 'localStorage' = 'sessionStorage') => {
  if (typeof window === 'undefined') return null

  try {
    const storageApi = window[storage]
    const fullCacheKey = `${keyPrefix}_${cacheKey}`
    const cachedItem = storageApi.getItem(fullCacheKey)
    
    if (!cachedItem) return null

    const cached: CachedData<unknown> = JSON.parse(cachedItem)
    const now = Date.now()
    const isExpired = now > cached.expiry
    const remainingTime = cached.expiry - now

    return {
      isExpired,
      remainingTime: Math.max(0, remainingTime),
      timestamp: cached.timestamp,
      expiry: cached.expiry
    }
  } catch (error) {
    console.error('Error getting cache info:', error)
    return null
  }
}