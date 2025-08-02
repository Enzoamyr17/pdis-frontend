"use client"

import { useApiCache } from "./useApiCache"
import { useOptimizedSession } from "./useOptimizedSession"
import { useCallback } from "react"

interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
  end: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted"
  }>
  conferenceData?: {
    conferenceSolution?: {
      name: string
    }
    entryPoints?: Array<{
      entryPointType: string
      uri: string
    }>
  }
  creator?: {
    email: string
    displayName?: string
  }
  organizer?: {
    email: string
    displayName?: string
  }
  status: string
  htmlLink: string
  created: string
  updated: string
}

interface CalendarEventsResponse {
  events: GoogleCalendarEvent[]
  debug?: {
    count: number
    timeRange: string
    userId: string
  }
}

export type { GoogleCalendarEvent }

export function useCalendarEvents() {
  const { data: session, status } = useOptimizedSession()
  
  // Create cache key based on user ID
  const cacheKey = `calendar_events_${session?.user?.id || 'anonymous'}`
  
  const fetcher = useCallback(async (): Promise<CalendarEventsResponse> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch('/api/calendar/events')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar events: ${response.statusText}`)
    }
    
    return response.json()
  }, [session?.user?.id])

  const {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  } = useApiCache<CalendarEventsResponse>(cacheKey, fetcher, {
    duration: 5 * 60 * 1000, // 5 minutes cache for calendar events
    storage: 'sessionStorage',
    enabled: status !== 'loading' && !!session?.user?.id
  })

  // Helper function to create a new event and refresh cache
  const createEvent = async (eventData: {
    title: string
    start: string
    end: string
    description?: string
    location?: string
    attendees?: string[]
    allDay?: boolean
    timeZone?: string
  }) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })

    if (!response.ok) {
      throw new Error(`Failed to create calendar event: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Clear cache and refresh to get updated data
    clearCache()
    refresh()
    
    return result
  }

  // Helper function to update an event and refresh cache
  const updateEvent = async (eventId: string, eventData: Partial<{
    title: string
    start: string
    end: string
    description?: string
    location?: string
    attendees?: string[]
    allDay?: boolean
    timeZone?: string
  }>) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`/api/calendar/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })

    if (!response.ok) {
      throw new Error(`Failed to update calendar event: ${response.statusText}`)
    }

    const result = await response.json()
    
    // Clear cache and refresh to get updated data
    clearCache()
    refresh()
    
    return result
  }

  // Helper function to delete an event and refresh cache
  const deleteEvent = async (eventId: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`/api/calendar/events/${eventId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`Failed to delete calendar event: ${response.statusText}`)
    }

    // Clear cache and refresh to get updated data
    clearCache()
    refresh()
    
    return true
  }

  return {
    events: data?.events || [],
    debug: data?.debug,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache,
    createEvent,
    updateEvent,
    deleteEvent
  }
}

// Utility function to clear all calendar-related caches
export const clearCalendarCaches = () => {
  if (typeof window === 'undefined') return

  try {
    const storage = window.sessionStorage
    const keys = Object.keys(storage)
    
    keys.forEach(key => {
      if (key.includes('pdis_api_cache_calendar_events_')) {
        storage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing calendar caches:', error)
  }
}

// Background refresh function (can be called periodically)
export const backgroundRefreshCalendarEvents = async () => {
  try {
    // This will trigger a background fetch without affecting the UI
    await fetch('/api/calendar/events', {
      method: 'HEAD' // Just check if data has changed
    })
  } catch (error) {
    console.error('Background refresh failed:', error)
  }
}