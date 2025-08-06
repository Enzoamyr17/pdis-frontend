"use client"

import { Check, ArrowLeft, X, Clock, User } from "lucide-react"
import { useState } from "react"

interface WorkflowStage {
  id: number
  name: string
  date?: string
  status?: string
}

interface WorkflowStatusProps {
  request: string
  costCenter: string
  status: WorkflowStage[]
  dateNeeded?: string
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        bgColor: 'bg-green',
        textColor: 'text-white',
        borderColor: 'border-green',
        icon: Check
      }
    case 'ongoing':
      return {
        bgColor: 'bg-yellow',
        textColor: 'text-white',
        borderColor: 'border-yellow',
        icon: Clock
      }
    case 're-validation':
      return {
        bgColor: 'bg-orange',
        textColor: 'text-white',
        borderColor: 'border-orange',
        icon: ArrowLeft
      }
    case 'cancelled':
      return {
        bgColor: 'bg-red',
        textColor: 'text-white',
        borderColor: 'border-red',
        icon: X
      }
    case 'user':
      return {
        bgColor: 'bg-light-blue',
        textColor: 'text-white',
        borderColor: 'border-light-blue',
        icon: User
      }
    default:
      return {
        bgColor: 'bg-greyed',
        textColor: 'text-greyed',
        borderColor: 'border-greyed',
        icon: Clock
      }
  }
}

export default function WorkflowStatus({ request, costCenter, status, dateNeeded = "" }: WorkflowStatusProps) {
  const [expandedStage, setExpandedStage] = useState<number | null>(null)

  const handleStageClick = (stageId: number) => {
    setExpandedStage(expandedStage === stageId ? null : stageId)
  }

  const handleMouseOut = () => {
    setExpandedStage(null)
  }

  const parseDateString = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
  }

  const getBorderStyle = () => {
    if (!dateNeeded) return 'border-none'
    
    const requestDate = parseDateString(dateNeeded)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    requestDate.setHours(0, 0, 0, 0)
    
    const isDueToday = requestDate.getTime() === today.getTime()
    const isOverdue = requestDate < today
    
    if (isDueToday) return 'border-2 border-yellow/40'
    if (isOverdue) return 'border-2 border-red/40'
    return 'border-none'
  }

  return (
    <div 
      className={`group/main flex flex-col gap-1 bg-white p-1 pt-2 hover:p-2 h-auto w-full rounded-2xl transition-all duration-400 transition-delay-1000 overflow-hidden shadow ${getBorderStyle()}`}
      onMouseLeave={handleMouseOut}
    >
      <div className="flex justify-between">
        <h1 className="my-auto text-nowrap text-sm font-bold pl-2 group-hover/main:text-lg duration-400">{request} | {costCenter}</h1>
        <h1 className="my-auto text-nowrap text-sm font-bold pr-2 group-hover/main:text-lg duration-400">{dateNeeded}</h1>
      </div>
      {/* Status */}
      <div className="m-auto flex gap-2 flex-wrap justify-evenly bg-light-bg p-1 group-hover/main:p-2 w-full rounded-2xl transition-all overflow-hidden duration-400 overflow-x-auto"
      >
        {status.map((stage) => {
          const statusStyles = getStatusStyles(stage.status || '')
          const IconComponent = statusStyles.icon
          const isExpanded = expandedStage === stage.id
          
          return (
            <div 
              key={stage.id}
              className={`cursor-pointer flex shrink-1 group-hover/main:basis-auto p-1 rounded-xl items-center gap-2 bg-white border duration-400 ${statusStyles.borderColor} ${
                isExpanded ? 'py-1 pl-1 pr-4 gap-1' : ''
              }`}
              onClick={() => handleStageClick(stage.id)}
            >
              <div className={`size-6 group-hover/main:size-8 p-1 rounded-lg ${statusStyles.bgColor} flex items-center justify-center duration-400`}>
                <IconComponent 
                  className={`size-4 group-hover/main:size-6 ${statusStyles.textColor} duration-400`}
                  strokeWidth={3} 
                />
              </div>
              <p className={`m-auto text-md group-hover/main:text-lg font-bold overflow-hidden duration-500 ${
                isExpanded ? 'opacity-0 max-h-0' : ''
              }`}>
                {stage.id}
              </p>
              <div className={`w-auto font-semibold text-sm text-nowrap overflow-hidden duration-500 ${
                isExpanded ? 'max-h-12 max-w-84' : 'max-w-0 max-h-0'
              }`}>
                <h1 className="leading-none">{stage.name}</h1>
                {stage.date && <h1 className="leading-none">{stage.date}</h1>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}