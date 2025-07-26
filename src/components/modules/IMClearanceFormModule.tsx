"use client"

import { FileCheck } from "lucide-react"

export default function IMClearanceFormModule() {
  return (
    <div className="h-full p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileCheck className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-semibold text-gray-700">IM Clearance Form</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <FileCheck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">IM Clearance Form Module</h2>
          <p className="text-gray-500 mb-6">Independent Manpower clearance form module is currently under development. Features will include clearance requests and approval workflows.</p>
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