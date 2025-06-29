import React from 'react'

import { Providers } from './components/providers'
import { HomePage } from './app/HomePage'

export default function ContentApp() {
  const [isdialogOpen, setIsDialogOpen] = React.useState(true)

  if (!isdialogOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-3 py-2 bg-black cursor-pointer   text-white rounded-full flex items-center justify-center shadow-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
          title="Open MOCA ADS Extension"
        >
          <span className="text-2xl">moca ads</span> <span className="text-2xl">🧩</span>
        </button>
      </div>
    )
  }

  return (
    <Providers partnerId="8c8cd8b3-e234-429c-90ba-c41357561e1b">
      <HomePage setIsDialogOpen={setIsDialogOpen} />
    </Providers>
  )
}
