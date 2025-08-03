"use client"

import { BookOpen, Building, Building2, Users, IdCard } from "lucide-react"
import { useState } from "react"

export default function PDDirectoryModule() {
  const [activeTab, setActiveTab] = useState("client")

  const tabs = [
    { id: "client", label: "Client", icon: Building },
    { id: "vendor", label: "Vendor", icon: Building2 },
    { id: "user", label: "User", icon: Users },
    { id: "im", label: "IM", icon: IdCard },
  ]

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-6 h-6 text-blue" />
        <h1 className="text-2xl font-semibold text-blue/90">PD Directory</h1>
      </div>
      
      <div className="bg-gradient-to-t from-blue/5 to-light-blue/25 rounded-lg shadow-sm border">
        <div className="p-4">
          <div className="border-b border-blue/20 mb-6">
            <div className="flex space-x-4">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-orange text-orange font-medium"
                        : "border-transparent text-blue/70 hover:text-blue/90"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "client" && (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-blue mx-auto mb-4" />
                <h2 className="text-xl font-medium text-blue/90 mb-2">Client Directory</h2>
                <p className="text-blue/70 mb-6">Comprehensive client database with contact information, project history, and account status.</p>
                <div className="inline-flex items-center px-4 py-2 bg-orange/10 border border-orange/20 rounded-lg">
                  <svg className="w-4 h-4 text-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-orange font-medium">Coming Soon</span>
                </div>
              </div>
            )}

            {activeTab === "vendor" && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-blue mx-auto mb-4" />
                <h2 className="text-xl font-medium text-blue/90 mb-2">Vendor Directory</h2>
                <p className="text-blue/70 mb-6">Complete vendor database with supplier information, contracts, and performance metrics.</p>
                <div className="inline-flex items-center px-4 py-2 bg-orange/10 border border-orange/20 rounded-lg">
                  <svg className="w-4 h-4 text-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-orange font-medium">Coming Soon</span>
                </div>
              </div>
            )}

            {activeTab === "user" && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-blue mx-auto mb-4" />
                <h2 className="text-xl font-medium text-blue/90 mb-2">User Directory</h2>
                <p className="text-blue/70 mb-6">Employee directory with organizational chart, roles, permissions, and contact details.</p>
                <div className="inline-flex items-center px-4 py-2 bg-orange/10 border border-orange/20 rounded-lg">
                  <svg className="w-4 h-4 text-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-orange font-medium">Coming Soon</span>
                </div>
              </div>
            )}

            {activeTab === "im" && (
              <div className="text-center py-12">
                <IdCard className="w-16 h-16 text-blue mx-auto mb-4" />
                <h2 className="text-xl font-medium text-blue/90 mb-2">Independent Manpower Directory</h2>
                <p className="text-blue/70 mb-6">Database of independent contractors, freelancers, and temporary staff with skills and availability.</p>
                <div className="inline-flex items-center px-4 py-2 bg-orange/10 border border-orange/20 rounded-lg">
                  <svg className="w-4 h-4 text-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-orange font-medium">Coming Soon</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}