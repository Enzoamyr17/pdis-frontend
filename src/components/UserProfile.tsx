"use client"
import { useState } from "react"
import { useUser } from "@/contexts/UserContext"
import Image from "next/image"

export default function UserProfile() {
  const { user } = useUser()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!user) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <p>Please log in to view profile</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 text-xs text-dark/60 font-medium group h-auto overflow-clip">
      {/* Always Visible: Name, Position, Employee Number */}
      <div className="flex gap-0 items-start">
        <div className="flex-1 min-w-0">
          <div className="space-y-0.5">
              <p className="font-bold text-blue truncate leading-tight">{user.name}</p>
              <p className="text-blue/70 leading-none py-1">{user.position}</p>
              <p className="text-blue/70 leading-none">{user.idNumber}</p>
          </div>
        </div>
        <div className="m-auto flex items-center gap-2 flex-shrink-0">
          
          <Image 
            src={user.picture} 
            alt={user.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border border-blue/20"
          />
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
      {isExpanded && (
        <div className="space-y-1 pt-1">
          {/* Employment Details */}
          <div className="space-y-0.5 py-2 border-t-2 border-blue/20">
            <div className="grid grid-cols-1 gap-0.5 capitalize">
                <p className="font-bold leading-none text-blue/90">Employment Date:</p>
                <p className="text-blue/70 pl-1 leading-none">{user.employmentDate}</p>
                <p className="font-bold leading-none text-blue/90 pt-2">Office:</p>
                <p className="text-blue/70 pl-1 leading-none">{user.office}</p>
                <p className="font-bold leading-none text-blue/90 pt-2">Group:</p>
                <p className="text-blue/70 pl-1 leading-none">{user.group}</p>
                <p className="font-bold leading-none text-blue/90 pt-2">Department:</p>
                <p className="text-blue/70 pl-1 leading-none">{user.department}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-0.5 py-2 border-t-2 border-blue/20">
              <p className="font-bold leading-none text-blue/90">Contact Number:</p>
              <p className="text-blue/70 pl-1 leading-none">{user.contactNumber}</p>
              <p className="font-bold leading-none pt-2 text-blue/90">PD Email:</p>
              <p className="text-blue/70 pl-1 leading-none">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  )
}