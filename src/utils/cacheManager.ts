"use client"

import { clearAllApiCaches } from "@/hooks/useApiCache"
import { clearProjectCaches } from "@/hooks/useProjects"
import { clearCalendarCaches } from "@/hooks/useCalendarEvents"
import { clearAllIMCaches } from "@/hooks/useIMRegistrations"
import { clearUserProfileCache } from "@/components/UserProfile"
import { clearSessionCache } from "@/hooks/useOptimizedSession"

// Cache invalidation strategies
export class CacheManager {
  
  // Clear all application caches
  static clearAllCaches() {
    try {
      // Clear API caches
      clearAllApiCaches('pdis_api_cache', 'sessionStorage')
      clearAllApiCaches('pdis_api_cache', 'localStorage')
      
      // Clear specific caches
      clearProjectCaches()
      clearCalendarCaches()
      clearAllIMCaches()
      clearUserProfileCache()
      clearSessionCache()
      
      console.log('All caches cleared successfully')
    } catch (error) {
      console.error('Error clearing all caches:', error)
    }
  }

  // Clear caches related to user data (call on sign out)
  static clearUserCaches() {
    try {
      clearUserProfileCache()
      clearSessionCache()
      clearProjectCaches()
      clearCalendarCaches()
      clearAllIMCaches()
      
      console.log('User-related caches cleared successfully')
    } catch (error) {
      console.error('Error clearing user caches:', error)
    }
  }

  // Clear project-related caches (call when projects are modified)
  static clearProjectRelatedCaches() {
    try {
      clearProjectCaches()
      
      // Also clear any IMCF caches since they depend on projects
      if (typeof window !== 'undefined') {
        const storage = window.sessionStorage
        const keys = Object.keys(storage)
        
        keys.forEach(key => {
          if (key.includes('imcf_') || key.includes('project_')) {
            storage.removeItem(key)
          }
        })
      }
      
      console.log('Project-related caches cleared successfully')
    } catch (error) {
      console.error('Error clearing project caches:', error)
    }
  }

  // Clear calendar-related caches (call when calendar events are modified)
  static clearCalendarRelatedCaches() {
    try {
      clearCalendarCaches()
      console.log('Calendar-related caches cleared successfully')
    } catch (error) {
      console.error('Error clearing calendar caches:', error)
    }
  }

  // Clear IM-related caches (call when IM registrations are modified)
  static clearIMRelatedCaches() {
    try {
      clearAllIMCaches()
      console.log('IM-related caches cleared successfully')
    } catch (error) {
      console.error('Error clearing IM caches:', error)
    }
  }

  // Smart cache invalidation based on cache age
  static performSmartInvalidation() {
    if (typeof window === 'undefined') return

    try {
      const now = Date.now()
      const storage = window.sessionStorage
      const keys = Object.keys(storage)
      
      keys.forEach(key => {
        if (key.startsWith('pdis_api_cache_')) {
          try {
            const cachedItem = storage.getItem(key)
            if (cachedItem) {
              const cached = JSON.parse(cachedItem)
              
              // If cache is expired, remove it
              if (cached.expiry && now > cached.expiry) {
                storage.removeItem(key)
              }
              
              // If cache is older than 1 hour, consider it stale
              const oneHour = 60 * 60 * 1000
              if (cached.timestamp && (now - cached.timestamp) > oneHour) {
                storage.removeItem(key)
              }
            }
          } catch {
            // If we can't parse the cached item, remove it
            storage.removeItem(key)
          }
        }
      })
      
      console.log('Smart cache invalidation completed')
    } catch (error) {
      console.error('Error during smart cache invalidation:', error)
    }
  }

  // Get cache statistics
  static getCacheStats() {
    if (typeof window === 'undefined') {
      return { totalCaches: 0, totalSize: 0, cachesByType: {} }
    }

    try {
      const stats = {
        totalCaches: 0,
        totalSize: 0,
        cachesByType: {} as Record<string, number>
      }

      const storage = window.sessionStorage
      const keys = Object.keys(storage)
      
      keys.forEach(key => {
        if (key.startsWith('pdis_api_cache_')) {
          stats.totalCaches++
          
          const item = storage.getItem(key)
          if (item) {
            stats.totalSize += item.length
            
            // Categorize cache types
            if (key.includes('projects_')) {
              stats.cachesByType.projects = (stats.cachesByType.projects || 0) + 1
            } else if (key.includes('calendar_')) {
              stats.cachesByType.calendar = (stats.cachesByType.calendar || 0) + 1
            } else if (key.includes('im_')) {
              stats.cachesByType.im = (stats.cachesByType.im || 0) + 1
            } else if (key.includes('user_')) {
              stats.cachesByType.user = (stats.cachesByType.user || 0) + 1
            } else {
              stats.cachesByType.other = (stats.cachesByType.other || 0) + 1
            }
          }
        }
      })

      return stats
    } catch {
      return { totalCaches: 0, totalSize: 0, cachesByType: {} }
    }
  }

  // Check if storage is getting full and clean up if needed
  static checkStorageQuota() {
    if (typeof window === 'undefined') return

    try {
      // Try to estimate storage usage
      const storage = window.sessionStorage
      let totalSize = 0
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key) {
          const item = storage.getItem(key)
          if (item) {
            totalSize += key.length + item.length
          }
        }
      }

      // If storage seems to be getting full (> 4MB), perform cleanup
      const maxSize = 4 * 1024 * 1024 // 4MB
      if (totalSize > maxSize) {
        console.warn('SessionStorage is getting full, performing cleanup')
        this.performSmartInvalidation()
      }
    } catch (error) {
      console.error('Error checking storage quota:', error)
    }
  }

  // Initialize cache manager (call on app startup)
  static initialize() {
    try {
      // Perform initial cleanup of expired caches
      this.performSmartInvalidation()
      
      // Check storage quota
      this.checkStorageQuota()
      
      // Set up periodic cleanup (every 15 minutes)
      if (typeof window !== 'undefined') {
        setInterval(() => {
          this.performSmartInvalidation()
          this.checkStorageQuota()
        }, 15 * 60 * 1000) // 15 minutes
      }
      
      console.log('Cache manager initialized')
    } catch (error) {
      console.error('Error initializing cache manager:', error)
    }
  }
}

// Export utility functions for use in components
export const {
  clearAllCaches,
  clearUserCaches,
  clearProjectRelatedCaches,
  clearCalendarRelatedCaches,
  clearIMRelatedCaches,
  performSmartInvalidation,
  getCacheStats,
  checkStorageQuota,
  initialize
} = CacheManager