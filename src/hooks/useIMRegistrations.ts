"use client"

import { useApiCache } from "./useApiCache"
import { useOptimizedSession } from "./useOptimizedSession"
import { useCallback } from "react"

interface IMRegistration {
  id: string
  imNumber: string
  lastName: string
  firstName: string
  middleName?: string
  birthday: string
  contactNo: string
  email: string
  houseNo: string
  street: string
  subdivision?: string
  region: string
  province: string
  cityMunicipality: string
  barangay: string
  ownGcash: boolean
  authorizedGcash?: string
  authorizedReceiver?: string
  fbLink?: string
  imFilesLink?: string
  status: string
  registeredBy: string
  registeredByUser?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface IMSearchParams {
  search?: string
  status?: string
  department?: string
  dateFrom?: string
  dateTo?: string
}

export function useIMRegistrations(searchParams: IMSearchParams = {}) {
  const { data: session, status } = useOptimizedSession()
  
  // Create cache key based on user and search parameters
  const searchKey = Object.entries(searchParams)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}:${value}`)
    .join('|')
  
  const cacheKey = `im_registrations_${session?.user?.id || 'anonymous'}_${searchKey}`
  
  const fetcher = useCallback(async (): Promise<IMRegistration[]> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    // Build query string
    const queryParams = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value)
      }
    })

    const url = queryParams.toString() 
      ? `/api/im?${queryParams.toString()}`
      : '/api/im'
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IM registrations: ${response.statusText}`)
    }
    
    return response.json()
  }, [session?.user?.id, searchParams])

  const {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  } = useApiCache<IMRegistration[]>(cacheKey, fetcher, {
    duration: 15 * 60 * 1000, // 15 minutes cache for IM registrations
    storage: 'sessionStorage',
    enabled: status !== 'loading' && !!session?.user?.id
  })

  // Helper function to create a new IM registration and refresh cache
  const createIMRegistration = async (registrationData: Omit<IMRegistration, 'id' | 'imNumber' | 'status' | 'registeredBy' | 'registeredByUser' | 'createdAt' | 'updatedAt'>) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch('/api/im', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    })

    if (!response.ok) {
      throw new Error(`Failed to create IM registration: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Clear all IM-related caches and refresh
    clearAllIMCaches()
    refresh()
    
    return result
  }

  // Helper function to update IM registration status
  const updateIMStatus = async (imId: string, status: string, remarks?: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`/api/im/${imId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, remarks })
    })

    if (!response.ok) {
      throw new Error(`Failed to update IM status: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Clear all IM-related caches and refresh
    clearAllIMCaches()
    refresh()
    
    return result
  }

  return {
    registrations: data || [],
    loading,
    error,
    refresh,
    clearCache,
    isFromCache,
    createIMRegistration,
    updateIMStatus
  }
}

// Hook for getting a single IM registration (with caching)
export function useIMRegistration(imId: string) {
  const { data: session, status } = useOptimizedSession()
  
  const cacheKey = `im_registration_${imId}`
  
  const fetcher = useCallback(async (): Promise<IMRegistration> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`/api/im/${imId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IM registration: ${response.statusText}`)
    }
    
    return response.json()
  }, [session?.user?.id, imId])

  const {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  } = useApiCache<IMRegistration>(cacheKey, fetcher, {
    duration: 20 * 60 * 1000, // 20 minutes cache for individual IM registrations
    storage: 'sessionStorage',
    enabled: status !== 'loading' && !!session?.user?.id
  })

  return {
    registration: data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  }
}

// Hook for IM search functionality with caching
export function useIMSearch(query: string, filters: Omit<IMSearchParams, 'search'> = {}) {
  const searchParams = { search: query, ...filters }
  return useIMRegistrations(searchParams)
}

// Utility function to clear all IM-related caches
export const clearAllIMCaches = () => {
  if (typeof window === 'undefined') return

  try {
    const storage = window.sessionStorage
    const keys = Object.keys(storage)
    
    keys.forEach(key => {
      if (key.includes('pdis_api_cache_im_registration') || key.includes('pdis_api_cache_im_search')) {
        storage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing IM caches:', error)
  }
}

// Background refresh function for IM data
export const backgroundRefreshIMData = async () => {
  try {
    await fetch('/api/im', {
      method: 'HEAD'
    })
  } catch (error) {
    console.error('Background IM refresh failed:', error)
  }
}