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
    <div className="flex flex-col gap-1 text-[10px]">
      {/* Always Visible: Name, Position, Employee Number */}
      <div className="flex gap-2 items-start">
        <div className="flex-1 min-w-0">
          <div className="space-y-0.5">
            <div>
              <p className="text-[11px] font-semibold text-blue truncate leading-tight">{user.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-700 leading-tight">{user.position}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-700">{user.idNumber}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue hover:text-blue/70 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <Image 
            src={user.picture} 
            alt={user.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border border-blue/20"
          />
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-1 pt-1">
          {/* Employment Details */}
          <div className="space-y-0.5 pt-1 border-t border-blue/10">
            <div className="grid grid-cols-1 gap-0.5">
              <div>
                <p className="text-[9px] font-medium text-blue/70 uppercase tracking-wide">Employment Date:</p>
                <p className="text-[10px] text-zinc-700">{user.employmentDate}</p>
              </div>
              <div>
                <p className="text-[9px] font-medium text-blue/70 uppercase tracking-wide">Office:</p>
                <p className="text-[10px] text-zinc-700">{user.office}</p>
              </div>
              <div>
                <p className="text-[9px] font-medium text-blue/70 uppercase tracking-wide">Group:</p>
                <p className="text-[10px] text-zinc-700 leading-tight">{user.group}</p>
              </div>
              <div>
                <p className="text-[9px] font-medium text-blue/70 uppercase tracking-wide">Department:</p>
                <p className="text-[10px] text-zinc-700 leading-tight">{user.department}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-0.5 pt-1 border-t border-blue/10">
            <div>
              <p className="text-[9px] font-medium text-blue/70 uppercase tracking-wide">Contact Number:</p>
              <p className="text-[10px] text-zinc-700">{user.contactNumber}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium text-blue/70 uppercase tracking-wide">PD Email:</p>
              <p className="text-[10px] text-zinc-700 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}