"use client"

import { Receipt } from "lucide-react"

export default function BRReimbursementModule() {
  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">BR Reimbursement</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
        <div className="p-4">
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-blue mx-auto mb-4" />
            <h2 className="text-xl font-medium text-blue/90 mb-2">BR Reimbursement Module</h2>
            <p className="text-blue/70 mb-6">This module is currently under development. Features will include expense claims, receipt management, and reimbursement processing.</p>
            <div className="inline-flex items-center px-4 py-2 bg-orange/10 border border-orange/20 rounded-lg">
              <svg className="w-4 h-4 text-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-orange font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}