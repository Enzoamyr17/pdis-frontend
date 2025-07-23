"use client"
import { useUser } from "@/contexts/UserContext"
import Image from "next/image"

export default function UserProfile() {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <p>Please log in to view profile</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 text-[10px]">
      {/* Profile Picture and Basic Info */}
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
        <div className="flex-shrink-0">
          <Image 
            src={user.picture} 
            alt={user.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border border-blue/20"
          />
        </div>
      </div>

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
  )
}