"use client"

export default function TodaysNews() {
  return (
    <div className="border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 rounded-xl p-2 flex-shrink-0">
      <h2 className="text-lg pl-1 font-semibold mb-2 text-blue">Today&apos;s News</h2>

      <div className="text-xs font-semibold text-blue/90 space-y-0 px-1">
        <div className="bg-white flex border border-light-blue p-2 rounded">
          <p className="my-auto pr-2">🎉</p>
          <p className="my-auto">It&apos;s Carlo Felipe&apos;s Birthday!</p>
        </div>
        <div className="bg-white flex border border-light-blue p-2 rounded">
          <p className="my-auto pr-2">🎂</p>
          <p className="my-auto">It&apos;s Renzo Gregorio&apos;s 2 years with Project Duo</p>
        </div>
        <div className="bg-white flex border border-light-blue p-2 rounded">
          <p className="my-auto pr-2">🏃</p>
          <p className="my-auto">PD-Ganap: Sportsfest 2025!</p>
        </div>
        <div className="bg-white flex border border-light-blue p-2 rounded">
          <p className="my-auto pr-2">🏗️</p>
          <p className="my-auto">Ongoing Project: Unionbank Barangay 742</p>
        </div>
      </div>

    </div>
  )
}