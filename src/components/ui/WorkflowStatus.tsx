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
        icon: Check,
        opacity: 'opacity-100',
        bg: 'status-bg'
      }
    case 'ongoing':
      return {
        bgColor: 'bg-yellow',
        textColor: 'text-white',
        borderColor: 'border-yellow',
        icon: Clock,
        bg: 'status-bg'
      }
    case 're-validation':
      return {
        bgColor: 'bg-orange',
        textColor: 'text-white',
        borderColor: 'border-orange',
        icon: ArrowLeft,
        bg: 'status-bg filter grayscale-90'
      }
    case 'cancelled':
      return {
        bgColor: 'bg-red',
        textColor: 'text-white',
        borderColor: 'border-red',
        icon: X,
        bg: 'status-bg filter grayscale-90'
      }
    case 'user':
      return {
        bgColor: 'bg-light-blue',
        textColor: 'text-white',
        borderColor: 'border-light-blue',
        icon: User,
        bg: 'status-bg filter grayscale-90'
      }
    default:
      return {
        bgColor: 'bg-greyed',
        textColor: 'text-greyed',
        borderColor: 'border-greyed',
        icon: Clock,
        bg: 'status-bg filter grayscale-90'
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
      className={`flex gap-1 p-1 h-auto w-full rounded-2xl transition-all duration-400 transition-delay-1000 overflow-hidden shadow ${getBorderStyle()}`}
      onMouseLeave={handleMouseOut}
      
    >
      <div className="flex w-1/3 justify-start overflow-hidden">
        <h1 className="my-auto text-nowrap line-clamp-1 text-clip text-sm font-bold pl-2 duration-400">{request} | {costCenter}</h1>
      </div>
      
      {/* Status */}
      <div className="m-auto w-2/3  max-w- flex gap-2 flex-wrap justify-evenly p-1 rounded-2xl bg-light-bg transition-all overflow-hidden duration-400 overflow-x-auto" 
      >
        {status.map((stage) => {
          const statusStyles = getStatusStyles(stage.status || '')
          const isExpanded = expandedStage === stage.id
          
          return (
            <div 
              key={stage.id}
              className={`cursor-pointer flex shrink-1 p-0 w-auto h-8 min-w-8 items-center border duration-400 ${statusStyles.borderColor} ${
                isExpanded ? 'pr-4 gap-1 max-w-44 rounded-lg bg-white' : `${statusStyles.bg} status-bg max-w-8 rounded-full`
              }`}
              onClick={() => handleStageClick(stage.id)}
            >
              {stage.status === 'completed' ? (
                <Check className={`m-auto h-6 w-6 p-1 text-white ${statusStyles.bgColor} overflow-hidden duration-500 rounded-full ${
                  isExpanded ? 'opacity-0 max-h-0' : ''
                }`} />
              ) : stage.status === 'ongoing' ? (
                <Clock className={`m-auto h-6 w-6 p-1 text-white ${statusStyles.bgColor} overflow-hidden duration-500 rounded-full ${
                  isExpanded ? 'opacity-0 max-h-0' : ''
                }`} />
              ) : (
                <p className={`m-auto text-md font-bold overflow-hidden duration-500 ${
                  isExpanded ? 'opacity-0 max-h-0' : ''
                }`}>
                  {stage.id}
                </p>
              )}
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

      <div className="flex w-1/6 justify-end overflow-hidden">
        <h1 className="my-auto text-nowrap text-sm font-bold pr-2 duration-400">{dateNeeded}</h1>
      </div>
    </div>
  )
}