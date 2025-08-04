"use client"

import { Check, ArrowLeft, X, Clock } from "lucide-react"
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
    default:
      return {
        bgColor: 'bg-greyed',
        textColor: 'text-greyed',
        borderColor: 'border-greyed',
        icon: Clock
      }
  }
}

export default function FormStatus({ request, costCenter, status }: WorkflowStatusProps) {
  return (
    <div className="flex flex-col gap-1 bg-white p-2 h-auto w-full rounded-2xl transition-all duration-400 overflow-hidden">
      <h1 className="my-auto text-nowrap text-lg font-bold pl-2 duration-400">{request} | {costCenter}</h1>
      {/* Status */}
      <div className="m-auto flex gap-2 flex-nowrap justify-between bg-light-bg p-2 w-full rounded-2xl transition-all overflow-hidden duration-400 overflow-x-auto">
        {status.map((stage) => {
          const statusStyles = getStatusStyles(stage.status || '')
          const IconComponent = statusStyles.icon
          
          return (
            <div 
              key={stage.id}
              className={`flex shrink-1 basis-auto py-1 pl-1 pr-4 rounded-xl items-center gap-1 bg-white border duration-400 ${statusStyles.borderColor}`}
            >
              <div className={`size-8 p-1 rounded-lg ${statusStyles.bgColor} flex items-center justify-center duration-400`}>
                <IconComponent 
                  className={`size-6 ${statusStyles.textColor} duration-400`}
                  strokeWidth={3} 
                />
              </div>
              <p className="m-auto text-lg font-bold opacity-0 max-h-0 overflow-hidden duration-500">
                {stage.id}
              </p>
              <div className="w-auto font-semibold text-sm text-nowrap overflow-hidden max-h-12 max-w-84 duration-500">
                <h1>{stage.name}</h1>
                {stage.date && <h1>{stage.date}</h1>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}