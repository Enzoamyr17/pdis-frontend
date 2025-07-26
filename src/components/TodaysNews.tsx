"use client"

export default function TodaysNews() {
  return (
    <div className="border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 rounded-xl p-2 flex-shrink-0">
      <h2 className="text-lg font-semibold mb-2 text-blue">Today&apos;s News</h2>
      <div className="text-sm text-zinc-600 space-y-2">
        <div className="bg-white/30 p-2 rounded-lg">
          <p className="font-medium text-blue">🎉 It&apos;s Carlo Felipe&apos;s Birthday!</p>
        </div>
        <div className="bg-white/30 p-2 rounded-lg">
          <p className="font-medium text-blue">🎂 It&apos;s Renzo Gregorio&apos;s 2 years with Project Duo</p>
        </div>
        <div className="bg-white/30 p-2 rounded-lg">
          <p className="font-medium text-blue">🏃 PD-Ganap: Sportsfest 2025!</p>
        </div>
        <div className="bg-white/30 p-2 rounded-lg">
          <p className="font-medium text-blue">🏗️ Ongoing Project: Unionbank Barangay 742</p>
        </div>
      </div>
    </div>
  )
}