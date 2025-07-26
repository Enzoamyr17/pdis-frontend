"use client"

import { Car } from "lucide-react"

export default function VehicleRequisitionModule() {
  return (
    <div className="h-full p-6">
      <div className="flex items-center gap-3 mb-6">
        <Car className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-semibold text-gray-700">Vehicle Requisition</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">Vehicle Requisition Module</h2>
          <p className="text-gray-500 mb-6">This module is currently under development. Features will include vehicle booking, scheduling, and maintenance tracking.</p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-600 font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}