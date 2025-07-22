import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Dashboard() {
  return (
    // wag galawin ung className !!! "m-auto w-full h-full"
    <div className="m-auto w-full h-full">
      <ResizablePanelGroup direction="horizontal">

        <ResizablePanel>
          {/* Widget Bar */}
          <div className="p-0 flex flex-col gap-2 h-full overflow-y-auto max-w-full mr-2">
            <div className="bg-blue/20 rounded-xl p-2 min-h-64">
              <h1>User Profile</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Service Request Tracker</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Approval Center</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Bulletin Board</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Calendar</h1>
            </div>
            <div className="bg-blue/20 rounded-xl p-2 min-h-54">
              <h1>Advisory Center</h1>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle/>
        <ResizablePanel>
          {/* Main Work Area */}
          <div className="flex flex-col gap-2">
            <div className="rounded-xl p-2 h-1/2 border border-zinc-400/20 bg-gradient-to-br from-light-blue/10 to-light-blue/20">
              <h1>Service Request Tracker and Approval Center</h1>
            </div>
            <div className="rounded-xl p-2 h-1/2 border border-zinc-400/20 bg-gradient-to-br from-light-blue/10 to-light-blue/20">
              <h1>User To do List</h1>
            </div>
            
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>

      

      

    </div>
  );
}