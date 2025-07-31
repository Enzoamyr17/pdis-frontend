"use client"

import { Calendar } from "lucide-react"
import BigCalendar from "@/components/BigCalendar"

export default function BigCalendarModule() {
  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">Big Calendar</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border h-full">
        <div className="p-4 h-full">
          <BigCalendar />
        </div>
      </div>
    </div>
  )
}