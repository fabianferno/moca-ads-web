import React from 'react'

import { Providers } from './components/providers'
import { BaseComponent } from './app/BaseComponent'
import { adInjector } from './utils/adInjector'

export default function ContentApp() {
  const [isdialogOpen, setIsDialogOpen] = React.useState(true)
  const [adsEnabled, setAdsEnabled] = React.useState(true)
  const [injectedAdsCount, setInjectedAdsCount] = React.useState(0)

  // Update injected ads count periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setInjectedAdsCount(adInjector.getInjectedAdsCount())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleAds = () => {
    if (adsEnabled) {
      adInjector.destroy()
      setAdsEnabled(false)
    } else {
      adInjector.init()
      setAdsEnabled(true)
    }
  }

  const reinjectAds = () => {
    adInjector.reinjectAds()
  }

  if (!isdialogOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {/* Main extension button */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-3 py-2 bg-black cursor-pointer text-white rounded-full flex items-center justify-center shadow-lg border-2 border-black transition-all duration-200 transform hover:scale-105"
          title="Open MOCA ADS Extension"
        >
          <span className="text-sm font-bold">MOCA ADS</span> <span className="text-lg ml-1">🧩</span>
        </button>

        {/* Ads status indicator */}
        <div className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-bold text-center shadow-lg">
          <div className={`flex items-center justify-center gap-1 ${adsEnabled ? 'text-green-600' : 'text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${adsEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {adsEnabled ? 'ON' : 'OFF'}
          </div>
          {adsEnabled && (
            <div className="text-gray-600 text-xs">
              {injectedAdsCount} ads
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Providers>
      <BaseComponent
        setIsDialogOpen={setIsDialogOpen}
        adsEnabled={adsEnabled}
        injectedAdsCount={injectedAdsCount}
        onToggleAds={toggleAds}
        onReinjectAds={reinjectAds}
      />
    </Providers>
  )
}
