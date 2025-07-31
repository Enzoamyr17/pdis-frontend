"use client"

import { createContext, useContext, ReactNode } from "react"
import { SessionProvider } from "next-auth/react"

type AuthContextType = object

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthContext.Provider value={{}}>
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  )
}