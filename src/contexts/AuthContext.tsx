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
    <SessionProvider
      // Reduce session polling interval from default 4 minutes to 10 minutes
      refetchInterval={10 * 60} // 10 minutes
      // Only refetch session when window regains focus after 5 minutes
      refetchOnWindowFocus={false}
      // Disable automatic refetch when user comes back online
      refetchWhenOffline={false}
    >
      <AuthContext.Provider value={{}}>
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  )
}