"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ServiceRequestTracker from './ServiceRequestTracker'
import UserTodoList from './UserTodoList'
import { useModule } from '@/contexts/ModuleContext'

export default function WorkingArea() {
  const { activeModule } = useModule()

  if (activeModule) {
    const ModuleComponent = activeModule.component
    return (
      <div className="h-full p-2">
        <ModuleComponent />
      </div>
    )
  }

  return (
    <div className="h-full p-2">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel className="py-2" defaultSize={50}>
          <ServiceRequestTracker />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="py-2" defaultSize={50}>
          <UserTodoList />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}