"use client"

export default function ServiceRequestTracker() {
  return (
    <div className="rounded-xl p-2 h-full border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45">
      <h1 className="text-lg font-semibold mb-2 text-blue">Service Request Tracker and Approval Center</h1>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-3">
            <svg className="w-12 h-12 text-orange-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium text-orange-600 mb-1">🎉 Congrats!</p>
          <p className="text-sm text-zinc-600">You don&apos;t have any pending approvals or service requests!</p>
          <p className="text-xs text-zinc-500 mt-2">All caught up and ready to go!</p>
        </div>
      </div>
    </div>
  )
}