"use client"

import React, { createContext, useContext, useState } from 'react'

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

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
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