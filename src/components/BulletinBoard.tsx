"use client"

export default function BulletinBoard() {
  return (
    <div className="border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 rounded-xl p-2 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-2 text-blue">Bulletin Board</h2>
      <div className="text-sm text-zinc-600 space-y-2">
        <div className="bg-white/30 p-2 rounded-lg border-l-4 border-blue">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
            <p className="font-medium text-blue">Sample Advisory with PDF</p>
          </div>
        </div>
        <div className="bg-white/30 p-2 rounded-lg border-l-4 border-blue">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
            <p className="font-medium text-blue">Sample Advisory with PDF</p>
          </div>
        </div>
      </div>
    </div>
  )
}