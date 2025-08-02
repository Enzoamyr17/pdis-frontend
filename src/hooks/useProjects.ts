"use client"

import { useApiCache } from "./useApiCache"
import { useOptimizedSession } from "./useOptimizedSession"
import { useCallback } from "react"

interface Project {
  id: string
  projectID: string
  projectName: string
  displayName: string
  type: string
  brand: string
  projectDate: string
  projectVenue: string
  internalBudgetInitial: number
  internalBudgetCurrent: number
  accountManager?: {
    id: string
    name: string
    email: string
  }
  projectManager?: {
    id: string
    name: string
    email: string
  }
  cesCount: number
  ces: Array<{
    id: string
    ceID: string
    cepdNumber: string
    version: string
  }>
}

interface ProjectsResponse {
  projects: Project[]
  total: number
}

export type { Project }

export function useProjects(searchQuery = '') {
  const { data: session, status } = useOptimizedSession()
  
  // Create cache key based on user role and search query
  const user = session?.user
  const cacheKey = `projects_${user?.id || 'anonymous'}_${searchQuery.toLowerCase().trim()}`
  
  const fetcher = useCallback(async (): Promise<ProjectsResponse> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const url = searchQuery 
      ? `/api/projects?search=${encodeURIComponent(searchQuery)}`
      : '/api/projects'
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`)
    }
    
    return response.json()
  }, [session?.user?.id, searchQuery])

  const {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  } = useApiCache<ProjectsResponse>(cacheKey, fetcher, {
    duration: 10 * 60 * 1000, // 10 minutes cache
    storage: 'sessionStorage',
    enabled: status !== 'loading' && !!session?.user?.id
  })

  return {
    projects: data?.projects || [],
    total: data?.total || 0,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  }
}

// Hook for getting a single project (with caching)
export function useProject(projectId: string) {
  const { data: session, status } = useOptimizedSession()
  
  const cacheKey = `project_${projectId}`
  
  const fetcher = useCallback(async (): Promise<Project> => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`/api/projects/${projectId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }
    
    return response.json()
  }, [session?.user?.id, projectId])

  const {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  } = useApiCache<Project>(cacheKey, fetcher, {
    duration: 15 * 60 * 1000, // 15 minutes cache for individual projects
    storage: 'sessionStorage',
    enabled: status !== 'loading' && !!session?.user?.id
  })

  return {
    project: data,
    loading,
    error,
    refresh,
    clearCache,
    isFromCache
  }
}

// Utility function to clear all project-related caches
export const clearProjectCaches = () => {
  if (typeof window === 'undefined') return

  try {
    const storage = window.sessionStorage
    const keys = Object.keys(storage)
    
    keys.forEach(key => {
      if (key.includes('pdis_api_cache_projects_') || key.includes('pdis_api_cache_project_')) {
        storage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error clearing project caches:', error)
  }
}