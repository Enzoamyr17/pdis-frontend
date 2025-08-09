"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import UserTodoList from './UserTodoList'
import { useModule } from '@/contexts/ModuleContext'
import ServiceRequestTrackerModule from './ServiceRequestTrackerModule'
import ApprovalCenterModule from './ApprovalCenterModule'

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
    <div className="h-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel className="p-2 min-h-18" defaultSize={50}>
          <ServiceRequestTrackerModule />

        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="p-2 min-h-18" defaultSize={50}>
          <ApprovalCenterModule />
        
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="p-2 min-h-18" defaultSize={50}>
          <UserTodoList />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}