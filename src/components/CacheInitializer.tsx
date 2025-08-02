"use client"

import { useEffect } from "react"
import { CacheManager } from "@/utils/cacheManager"

export default function CacheInitializer() {
  useEffect(() => {
    // Initialize cache manager when app starts
    CacheManager.initialize()
    
    // Clean up on app unload
    const handleBeforeUnload = () => {
      CacheManager.performSmartInvalidation()
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // This component doesn't render anything
  return null
}