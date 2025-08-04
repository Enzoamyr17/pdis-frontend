"use client"

import WorkflowStatus from "./ui/WorkflowStatus"

export default function ServiceRequestTrackerModule() {
  const dateToday = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
  
  const VRF = [
    { id: 1, name: "Requestor", date: dateToday, status: 'completed' },
    { id: 2, name: "Processor", status: 're-validation' },
    { id: 3, name: "Driver Acknowledgement" },
    { id: 4, name: "Actual Trip" },
    { id: 5, name: "Clearance" }
  ];
  
  const VRF2 = [
    { id: 1, name: "Requestor", date: dateToday, status: 'completed' },
    { id: 2, name: "Processor", status: 'completed' },
    { id: 3, name: "Driver Acknowledgement", status: 'cancelled' },
    { id: 4, name: "Actual Trip" },
    { id: 5, name: "Clearance" }
  ];
  
  const IMCF = [
    { id: 1, name: "Clearance Requestor", date: dateToday, status: 'completed' },
    { id: 2, name: "Clearance Receiver", status: 'ongoing' },
    { id: 3, name: "Clearance Approver" },
    { id: 4, name: "AFG Validator" },
    { id: 5, name: "AFG Authorizer" },
    { id: 6, name: "Treasury Requestor" },
    { id: 7, name: "Treasury Approver" },
    { id: 8, name: "GCash Disbursement Requestor" },
    { id: 9, name: "GCash Disbursement Approver" }
  ];

  return (
    <div className="rounded-xl p-4 h-full border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-blue">Service Request Tracker</h2>
      <div className="flex flex-col gap-2 h-auto text-blue">
        <WorkflowStatus 
          request="Request"
          costCenter="Cost Center"
          status={VRF}
        />
        <WorkflowStatus 
          request="Request"
          costCenter="Cost Center"
          status={VRF2}
        />
        <WorkflowStatus 
          request="Request"
          costCenter="Cost Center"
          status={IMCF}
        />
      </div>
    </div>
  )
}