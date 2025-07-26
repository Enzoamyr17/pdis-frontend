"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  name: string
  position: string
  idNumber: string
  employmentDate: string
  office: string
  group: string
  department: string
  contactNumber: string
  email: string
  picture: string
}

interface UserContextType {
  user: User | null
  login: (email: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Mock user data
const mockUsers: User[] = [
  {
    id: 'PDID14-00001',
    name: 'Von Aaron Torres Mauleon',
    position: 'President and Chief Executive Officer',
    idNumber: 'PDID14-00001',
    employmentDate: '11 Aug 2014',
    office: 'GENERAL ADMINISTRATION',
    group: 'PRESIDENT AND CHIEF EXECUTIVE OFFICER',
    department: 'Project Duo Events and Marketing Corp.',
    contactNumber: '9176736784',
    email: 'von.mauleon@projectduo.com.ph',
    picture: '/assets/pd/von.jpeg'
  },
  {
    id: 'PDID18-00045',
    name: 'Alma Vida Mauleon Gerado',
    position: 'Director for Administrative Support Group',
    idNumber: 'PDID18-00045',
    employmentDate: '03 Sep 2018',
    office: 'GENERAL ADMINISTRATION',
    group: 'ADMINISTRATIVE SUPPORT GROUP (ASG)',
    department: 'ADMINISTRATIVE SUPPORT GROUP (ASG)',
    contactNumber: '9176354546',
    email: 'vida.gerado@projectduo.com.ph',
    picture: '/assets/pd/vida.jpeg'
  },
  {
    id: 'PDID18-00039',
    name: 'Julie Anne Ingao Mendoza',
    position: 'Associate Head for Business Unit 1',
    idNumber: 'PDID18-00039',
    employmentDate: '01 Mar 2018',
    office: 'GENERAL OPERATIONS',
    group: 'SALES AND OPERATIONS GROUP (SOG)',
    department: 'BUSINESS UNIT 1 (BU1)',
    contactNumber: '9176284703',
    email: 'julie.mendoza@projectduo.com.ph',
    picture: '/assets/pd/julie.jpeg'
  }
]

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('pdis-user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('pdis-user')
      }
    }
  }, [])

  const login = (email: string): boolean => {
    const foundUser = mockUsers.find(u => u.email === email)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('pdis-user', JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pdis-user')
  }

  const isAuthenticated = user !== null

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}