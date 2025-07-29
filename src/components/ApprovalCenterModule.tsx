"use client"

export default function ApprovalCenterModule() {
  return (
    <div className="rounded-xl p-4 h-full border border-zinc-500/10 shadow-sm bg-gradient-to-t from-orange/10 to-light-orange/45 overflow-hidden">
      <h2 className="text-lg font-semibold mb-4 text-orange-600">Approval Center</h2>
      <div className="flex items-center justify-center h-full overflow-hidden">
        <div className="text-center">
          <div className="mb-3">
            <svg className="w-12 h-12 text-blue-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium text-blue-600 mb-1">✅ Approved!</p>
          <p className="text-sm text-zinc-600">No pending approvals!</p>
          <p className="text-xs text-zinc-500 mt-2">All decisions have been made!</p>
        </div>
      </div>
    </div>
  )
}