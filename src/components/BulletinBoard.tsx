"use client"

import { Check } from "lucide-react"

export default function BulletinBoard() {
  return (
    <div className="border border-zinc-500/10 shadow-sm bg-gradient-to-t from-blue/10 to-light-blue/45 rounded-xl p-2 flex-shrink-0">
      <h2 className="text-lg pl-1 font-semibold mb-2 text-blue">Bulletin Board</h2>

      <div className="text-sm text-zinc-600 space-y-2">

        <div className="bg-white p-2 rounded-lg border-l-4 border-blue">
          <div className="flex items-center gap-2">
            <div className="aspect-square border-2 border-red-500 w-4 rounded">
            <Check className="text-blue size-3 m-auto"/>
            </div>
            <p className="font-semibold text-blue/80">Sample Advisory with PDF</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-lg border-l-4 border-blue">
          <div className="flex items-center gap-2">
            <div className="aspect-square border-2 border-red-500 w-4 rounded"></div>
            <p className="font-semibold text-blue/80">Sample Advisory with PDF</p>
          </div>
        </div>

      </div>
    </div>
  )
}