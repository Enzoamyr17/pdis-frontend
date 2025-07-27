"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ModuleData {
  id: string
  title: string
  component: React.ComponentType
}

interface ModuleContextType {
  activeModule: ModuleData | null
  setActiveModule: (module: ModuleData | null) => void
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined)

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModule] = useState<ModuleData | null>(null)

  useEffect(() => {
    const savedModule = localStorage.getItem('pdis-active-module')
    if (savedModule) {
      try {
        const savedModuleData = JSON.parse(savedModule)
        const { moduleRegistry } = require('@/components/modules/ModuleRegistry')
        const fullModule = moduleRegistry.get(savedModuleData.id)
        if (fullModule) {
          setActiveModule(fullModule)
        } else {
          localStorage.removeItem('pdis-active-module')
        }
      } catch (error) {
        localStorage.removeItem('pdis-active-module')
      }
    }
  }, [])

  const handleSetActiveModule = (module: ModuleData | null) => {
    setActiveModule(module)
    if (module) {
      localStorage.setItem('pdis-active-module', JSON.stringify({
        id: module.id,
        title: module.title
      }))
    } else {
      localStorage.removeItem('pdis-active-module')
    }
  }

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule: handleSetActiveModule }}>
      {children}
    </ModuleContext.Provider>
  )
}

export function useModule() {
  const context = useContext(ModuleContext)
  if (context === undefined) {
    throw new Error('useModule must be used within a ModuleProvider')
  }
  return context
}