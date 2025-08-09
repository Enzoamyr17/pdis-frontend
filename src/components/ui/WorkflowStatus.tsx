"use client"

import { Check, ArrowLeft, X, Clock, User } from "lucide-react"
import { useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip"

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
  const [openTooltip, setOpenTooltip] = useState<number | null>(null)

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
      
    >
      <div className="flex flex-col w-3/8 justify-start overflow-hidden">
        <h1 className="my-auto text-nowrap line-clamp-1 text-clip text-xs font-bold pl-2 duration-400">{request}</h1>
        <h1 className="my-auto text-nowrap line-clamp-1 text-clip text-xs font-bold pl-2 duration-400">{costCenter}</h1>
      </div>
      
      {/* Status */}
      <div className="m-auto w-full flex items-center justify-between p-1 rounded-2xl bg-light-bg transition-all overflow-hidden duration-400 overflow-x-auto" 
      >
        {status.map((stage, index) => {
          const statusStyles = getStatusStyles(stage.status || '')
          
          return (
            <div key={stage.id} className={`flex items-center ${index < status.length - 1 ? 'flex-1' : ''}`}>
              <Tooltip 
                open={openTooltip === stage.id}
                onOpenChange={(open) => setOpenTooltip(open ? stage.id : null)}
              >
                <TooltipTrigger asChild>
                  <div 
                    className={`cursor-pointer flex shrink-0 p-0 w-auto h-8 min-w-8 items-center border duration-400 ${statusStyles.borderColor} ${statusStyles.bg} status-bg max-w-8 rounded-full`}
                    onClick={() => setOpenTooltip(openTooltip === stage.id ? null : stage.id)}
                  >
                    {stage.status === 'completed' ? (
                      <Check className={`m-auto h-6 w-6 p-1 text-white ${statusStyles.bgColor} rounded-full`} />
                    ) : stage.status === 'ongoing' ? (
                      <Clock className={`m-auto h-6 w-6 p-1 text-white ${statusStyles.bgColor} rounded-full`} />
                    ) : (
                      <p className={`m-auto text-md font-bold`}>
                        {stage.id}
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-300">
                  <div className="text-sm font-semibold">{stage.name}</div>
                  {stage.date && <div className="text-xs text-gray-600 mt-1">{stage.date}</div>}
                </TooltipContent>
              </Tooltip>
              
              {index < status.length - 1 && (
                <div className="flex-1 h-0 border-t-3 border-dashed border-gray-600 mx-1"></div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex w-1/4 justify-end overflow-hidden">
        <h1 className="my-auto text-nowrap text-sm font-bold pr-2 duration-400">{dateNeeded}</h1>
      </div>
    </div>
  )
}