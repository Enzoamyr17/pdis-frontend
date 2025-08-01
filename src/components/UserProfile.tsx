"use client"

import { useOptimizedSession } from "@/hooks/useOptimizedSession"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"

interface UserData {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  position: string | null
  idNumber: string | null
  employmentDate: string | null
  office: string | null
  group: string | null
  department: string | null
  contactNumber: string | null
  pdEmail: string | null
  image?: string | null
}

const CACHE_KEY = 'user_profile_data'
const CACHE_EXPIRY_KEY = 'user_profile_expiry'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Export function to clear user profile cache (can be used by other components)
export const clearUserProfileCache = () => {
  try {
    sessionStorage.removeItem(CACHE_KEY)
    sessionStorage.removeItem(CACHE_EXPIRY_KEY)
  } catch (error) {
    console.error('Error clearing user profile cache:', error)
  }
}

export default function UserProfile() {
  const { data: session } = useOptimizedSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const getCachedData = () => {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY)
      const cacheExpiry = sessionStorage.getItem(CACHE_EXPIRY_KEY)
      
      if (cachedData && cacheExpiry) {
        const isExpired = Date.now() > parseInt(cacheExpiry)
        if (!isExpired) {
          return JSON.parse(cachedData)
        } else {
          // Clear expired cache
          sessionStorage.removeItem(CACHE_KEY)
          sessionStorage.removeItem(CACHE_EXPIRY_KEY)
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error)
    }
    return null
  }

  const setCachedData = (data: UserData) => {
    try {
      const expiryTime = Date.now() + CACHE_DURATION
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
      sessionStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString())
    } catch (error) {
      console.error('Error writing to cache:', error)
    }
  }

  const fetchUserData = useCallback(async (useCache = true) => {
    if (!session?.user?.email) {
      setLoading(false)
      return
    }

    // Check cache first if useCache is true
    if (useCache) {
      const cachedData = getCachedData()
      if (cachedData) {
        setUserData(cachedData)
        setLoading(false)
        return
      }
    }
    
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setCachedData(data) // Cache the fresh data
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData()
    } else {
      // Clear cache and user data when no session
      sessionStorage.removeItem(CACHE_KEY)
      sessionStorage.removeItem(CACHE_EXPIRY_KEY)
      setUserData(null)
      setLoading(false)
    }
  }, [session?.user?.email, fetchUserData])

  // Clear cache on component unmount
  useEffect(() => {
    return () => {
      // Optional: Clear cache on unmount if needed
      // sessionStorage.removeItem(CACHE_KEY)
      // sessionStorage.removeItem(CACHE_EXPIRY_KEY)
    }
  }, [])

  if (!session) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <p>Please log in to view profile</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <p>Unable to load profile data</p>
      </div>
    )
  }

  const formatFullName = (firstName: string | null, lastName: string | null) => {
    const parts = [firstName, lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'Name not provided'
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const firstInitial = firstName?.charAt(0) || ''
    const lastInitial = lastName?.charAt(0) || ''
    return firstInitial + lastInitial || 'U'
  }

  const formatEmploymentDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short', 
      year: 'numeric'
    })
  }

  const formatOffice = (office: string | null) => {
    if (!office) return 'Not specified'
    switch (office) {
      case 'PROJECT_DUO_GENERAL_ADMINISTRATION':
        return 'Project Duo General Administration'
      case 'PROJECT_DUO_GENERAL_OPERATIONS':
        return 'Project Duo General Operations'
      default:
        return office.replace('PROJECT_DUO_', '').replace(/_/g, ' ')
    }
  }

  const formatGroup = (group: string | null) => {
    if (!group) return 'Not specified'
    switch (group) {
      case 'ASG':
        return 'Administrative Support Group'
      case 'AFG':
        return 'Accounting Finance Group'
      case 'SOG':
        return 'Sales and Operations Group'
      case 'CG':
        return 'Creatives Group'
      default:
        return group
    }
  }

  const formatDepartment = (department: string | null) => {
    if (!department) return 'Not specified'
    switch (department) {
      case 'ASSETS_AND_PROPERTY_MANAGEMENT':
        return 'Assets and Property Management'
      case 'PEOPLE_MANAGEMENT':
        return 'People Management'
      case 'ACCOUNTS_PAYABLE':
        return 'Accounts Payable'
      case 'ACCOUNTS_RECEIVABLE':
        return 'Accounts Receivable'
      case 'TREASURY':
        return 'Treasury'
      case 'BUSINESS_UNIT_1':
        return 'Business Unit 1'
      case 'BUSINESS_UNIT_2':
        return 'Business Unit 2'
      case 'BUSINESS_DEVELOPMENT':
        return 'Business Development'
      case 'DESIGN_AND_MULTIMEDIA':
        return 'Design and Multimedia'
      case 'COPY_AND_DIGITAL':
        return 'Copy and Digital'
      default:
        return department.replace(/_/g, ' ')
    }
  }

  return (
    <div className="flex flex-col text-xs text-dark/60 font-medium group h-auto overflow-hidden duration-300">
      {/* Always Visible: Name, Position, Employee Number */}
      <div className="flex gap-0 items-start">
        <div className="flex-1 min-w-0">
          <div className="space-y-0.5">
            <p className="font-bold text-blue truncate leading-tight">
              {formatFullName(userData.firstName, userData.lastName)}
            </p>
            <p className="text-blue/70 leading-none py-1">
              {userData.position || 'Position not specified'}
            </p>
            <p className="text-blue/70 leading-none">
              {userData.idNumber || 'ID not assigned'}
            </p>
          </div>
        </div>
        <div className="m-auto flex items-center gap-2">
          {userData.image ? (
            <Image 
              src={userData.image} 
              alt={formatFullName(userData.firstName, userData.lastName)}
              width={40}
              height={40}
              className="m-auto w-10 h-10 rounded-full object-cover border border-blue/20"
            />
          ) : (
            <div className="m-auto w-10 h-10 rounded-full bg-blue/20 border border-blue/20 flex items-center justify-center">
              <span className="text-blue text-sm font-semibold">
                {getInitials(userData.firstName, userData.lastName)}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`space-y-1 h-auto ${isExpanded ? "max-h-[300px] pt-2 opacity-100" : "max-h-[0px] opacity-0"} transition-all duration-500`}>
        {/* Employment Details */}
        <div className="py-2 border-t-2 border-blue/20">
          <div className="grid grid-cols-1 gap-0.5 capitalize">
            <p className="font-bold leading-none text-blue/90">Employment Date:</p>
            <p className="text-blue/70 pl-1 leading-none">{formatEmploymentDate(userData.employmentDate)}</p>
            <p className="font-bold leading-none text-blue/90 pt-2">Office:</p>
            <p className="text-blue/70 pl-1 leading-none">{formatOffice(userData.office)}</p>
            <p className="font-bold leading-none text-blue/90 pt-2">Group:</p>
            <p className="text-blue/70 pl-1 leading-none">{formatGroup(userData.group)}</p>
            <p className="font-bold leading-none text-blue/90 pt-2">Department:</p>
            <p className="text-blue/70 pl-1 leading-none">{formatDepartment(userData.department)}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="py-2 border-t-2 border-blue/20">
          <p className="font-bold leading-none text-blue/90">Contact Number:</p>
          <p className="text-blue/70 pl-1 leading-none">{userData.contactNumber || 'Not provided'}</p>
          <p className="font-bold leading-none pt-2 text-blue/90">PD Email:</p>
          <p className="text-blue/70 pl-1 leading-none">{userData.pdEmail || 'Not provided'}</p>
        </div>
      </div>
    </div>
  )
}