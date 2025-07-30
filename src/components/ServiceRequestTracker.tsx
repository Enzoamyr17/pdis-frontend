"use client"

import ServiceRequestTrackerModule from './ServiceRequestTrackerModule'
import ApprovalCenterModule from './ApprovalCenterModule'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./ui/resizable"

export default function ServiceRequestTracker() {
  return (
    <div className="h-full px-2">
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel  className="py-2 min-h-18" defaultSize={50}>
          <ServiceRequestTrackerModule />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-zinc-500/10" />
        <ResizablePanel className="py-2 min-h-18" defaultSize={50}>
          <ApprovalCenterModule />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}