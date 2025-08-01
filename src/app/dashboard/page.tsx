'use client'

import { useState } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Calendar from '@/components/Calendar'
import UserProfile from '@/components/UserProfile'
import TodaysNews from '@/components/TodaysNews'
import BulletinBoard from '@/components/BulletinBoard'
import WorkingArea from '@/components/WorkingArea'
import { useModule } from '@/contexts/ModuleContext'
import { moduleRegistry } from '@/components/modules/ModuleRegistry'

export default function Dashboard() {
  const [resizeTrigger, setResizeTrigger] = useState(0)
  const { setActiveModule } = useModule()

  const handleCalendarClick = () => {
    const bigCalendarModule = moduleRegistry['big-calendar']
    if (bigCalendarModule) {
      setActiveModule(bigCalendarModule)
    }
  }

  return (
    // wag galawin ung className !!! "m-auto w-full h-full"
    <div className="m-auto w-full h-full">
      <ResizablePanelGroup direction="horizontal">

        <ResizablePanel 
          className="" 
          defaultSize={23}
          onResize={() => {
            setResizeTrigger(prev => prev + 1)
          }}
        >
          {/* Widget Bar */}
          <div className="flex flex-col h-full p-2 min-w-70">
            {/* Fixed User Profile at top */}
            <div className="border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 rounded-xl p-2 flex-shrink-0 mb-2">
              <div className="overflow-y-auto h-auto">
                <UserProfile />
              </div>
            </div>
            
            {/* Scrollable widgets below */}
            <div className="no-scrollbar flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-left min-h-0">
              <div 
                className="border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 rounded-xl p-2 flex-shrink-0 cursor-pointer hover:bg-gradient-to-t hover:from-blue/20 hover:to-light-blue/55 transition-all duration-200"
                onClick={handleCalendarClick}
              >
                <h2 className="text-lg font-semibold mb-2 pl-1 text-blue">Calendar</h2>
                <div className="h-40 overflow-hidden">
                  <Calendar resizeTrigger={resizeTrigger} />  
                </div>
              </div>
              <TodaysNews />
              <BulletinBoard />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle/>
        <ResizablePanel
          onResize={() => {
            setResizeTrigger(prev => prev + 1)
          }}
        >
          {/* Working Area */}
          <WorkingArea />
        </ResizablePanel>

      </ResizablePanelGroup>

      

      

    </div>
  );
}