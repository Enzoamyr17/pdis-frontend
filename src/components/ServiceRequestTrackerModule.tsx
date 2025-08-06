"use client"

import { useState, useMemo } from "react"
import { Search, ArrowUpDown } from "lucide-react"
import WorkflowStatus from "./ui/WorkflowStatus"

interface ServiceRequest {
  id: string
  request: string
  requestorName: string
  status: Array<{ id: number; name: string; date?: string; status?: string }>
  dateNeeded: string
}

export default function ServiceRequestTrackerModule() {
  const dateToday = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
  
  const VRF1 = [
    { id: 1, name: "Requisition", date: dateToday, status: 'completed' },
    { id: 2, name: "Processor", status: 'completed' },
    { id: 3, name: "Driver Acknowledgement", status: 'ongoing' },
    { id: 4, name: "Actual Trip" },
    { id: 5, name: "Clearance", status: "user" }
  ];
  
  const VRF2 = [
    { id: 1, name: "Requisition", date: dateToday, status: 'completed' },
    { id: 2, name: "Processor", status: 'completed' },
    { id: 3, name: "Driver Acknowledgement", status: 'cancelled' },
    { id: 4, name: "Actual Trip" },
    { id: 5, name: "Clearance", status: "user" }
  ];
  
  const VRF3 = [
    { id: 1, name: "Requisition", date: dateToday, status: 'completed' },
    { id: 2, name: "Processor", status: 'ongoing' },
    { id: 3, name: "Driver Acknowledgement" },
    { id: 4, name: "Actual Trip" },
    { id: 5, name: "Clearance", status: "user" }
  ];
  
  const IMCF1 = [
    { id: 1, name: "Requisition", date: dateToday, status: 'completed' },
    { id: 2, name: "Clearance Receiver", status: 'completed' },
    { id: 3, name: "Clearance Approver", status: 'completed' },
    { id: 4, name: "AFG Validator", status: 'ongoing' },
    { id: 5, name: "AFG Authorizer" },
    { id: 6, name: "Treasury Requestor", status: "user"  },
    { id: 7, name: "Treasury Approver" },
    { id: 8, name: "GCash Disbursement Requestor" },
    { id: 9, name: "GCash Disbursement Approver" }
  ];
  
  const IMCF2 = [
    { id: 1, name: "Requisition", date: dateToday, status: 'completed' },
    { id: 2, name: "Clearance Receiver", status: 'completed' },
    { id: 3, name: "Clearance Approver", status: 'ongoing' },
    { id: 4, name: "AFG Validator" },
    { id: 5, name: "AFG Authorizer" },
    { id: 6, name: "Treasury Requestor", status: "user"  },
    { id: 7, name: "Treasury Approver" },
    { id: 8, name: "GCash Disbursement Requestor" },
    { id: 9, name: "GCash Disbursement Approver" }
  ];
  
  const IMCF3 = [
    { id: 1, name: "Requisition", date: dateToday, status: 'completed' },
    { id: 2, name: "Clearance Receiver", status: 'ongoing' },
    { id: 3, name: "Clearance Approver" },
    { id: 4, name: "AFG Validator" },
    { id: 5, name: "AFG Authorizer" },
    { id: 6, name: "Treasury Requestor", status: "user"  },
    { id: 7, name: "Treasury Approver" },
    { id: 8, name: "GCash Disbursement Requestor" },
    { id: 9, name: "GCash Disbursement Approver" }
  ];

  const serviceRequests: ServiceRequest[] = [
    {
      id: "1",
      request: "VRF - 0001",
      requestorName: "Maria Santos",
      status: VRF1,
      dateNeeded: "06/08/2025"
    },
    {
      id: "2", 
      request: "VRF - 0002",
      requestorName: "Juan Dela Cruz",
      status: VRF2,
      dateNeeded: "26/08/2025"
    },
    {
      id: "3", 
      request: "VRF - 0003",
      requestorName: "Cynthia De Leon",
      status: VRF3,
      dateNeeded: "26/07/2025"
    },
    {
      id: "4",
      request: "IMCF - 0001", 
      requestorName: "Ana Rodriguezz",
      status: IMCF1,
      dateNeeded: "12/08/2025"
    },
    {
      id: "5",
      request: "IMCF - 0002",
      requestorName: "John Doe",
      status: IMCF2,
      dateNeeded: "12/08/2025"
    },
    {
      id: "6",
      request: "IMCF - 0003",
      requestorName: "Jane Doe",
      status: IMCF3,
      dateNeeded: "12/08/2025"
    }
  ];

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("dateNeeded")
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  const parseDateString = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
  }

  const allSuggestions = useMemo(() => {
    const requests = serviceRequests.map(req => req.request)
    const requestors = serviceRequests.map(req => req.requestorName)
    return [...new Set([...requests, ...requestors])]
  }, [serviceRequests])

  const filteredSuggestions = useMemo(() => {
    if (searchQuery.trim() === "") return []
    
    const query = searchQuery.toLowerCase()
    
    const startsWithResults = allSuggestions.filter(suggestion => 
      suggestion.toLowerCase().startsWith(query)
    )
    
    const includesResults = allSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query) && 
      !suggestion.toLowerCase().startsWith(query)
    )
    
    return [...startsWithResults, ...includesResults].slice(0, 5)
  }, [allSuggestions, searchQuery])

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = serviceRequests

    if (searchQuery.trim() !== "") {
      filtered = serviceRequests.filter(req => 
        req.request.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.requestorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "dateNeeded":
          const dateA = parseDateString(a.dateNeeded)
          const dateB = parseDateString(b.dateNeeded)
          return dateA.getTime() - dateB.getTime()
        case "request":
          return a.request.localeCompare(b.request)
        case "requestorName":
          return a.requestorName.localeCompare(b.requestorName)
        default:
          return 0
      }
    })

    return sorted
  }, [serviceRequests, searchQuery, sortBy])

  return (
    <div className="rounded-xl p-4 h-full border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue">Service Request Tracker</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue" />
            <input 
              type="text"
              placeholder="Search requests or requestors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-8 pr-4 py-1 text-sm border border-blue/20 rounded-lg bg-white text-blue placeholder-blue/50 focus:outline-none focus:ring-2 focus:ring-blue/20 w-64"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue/20 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 text-sm text-blue hover:bg-blue/10 cursor-pointer border-b border-blue/5 last:border-b-0"
                    onClick={() => {
                      setSearchQuery(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-8 pr-4 py-1 text-sm border border-blue/20 rounded-lg bg-white text-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            >
              <option value="dateNeeded">Date Needed (Closest First)</option>
              <option value="request">Request (ascending)</option>
              <option value="requestorName">Requestor Name (ascending)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 h-auto text-blue">
        {filteredAndSortedRequests.map((req) => (
          <WorkflowStatus 
            key={req.id}
            request={req.request}
            costCenter={req.requestorName}
            status={req.status}
            dateNeeded={req.dateNeeded}
          />
        ))}
      </div>
    </div>
  )
}