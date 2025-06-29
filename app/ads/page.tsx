"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Search, ExternalLink, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useActiveCampaigns, useCampaign, formatMocaAmount, credentialTypeNames, type Campaign } from "@/components/hooks/useMocaAds"

// Helper function to decode ad content from hash
const decodeAdContent = (hash: string) => {
  try {
    return JSON.parse(atob(hash))
  } catch {
    return {
      title: "Ad Content",
      description: "View campaign details",
      targetUrl: "#",
      imageUrl: "/placeholder.svg",
      adType: "banner"
    }
  }
}

// Component to fetch and display individual campaign
function CampaignCard({ campaignId }: { campaignId: bigint }) {
  const { data: campaign, isLoading } = useCampaign(campaignId)

  if (isLoading) {
    return (
      <div className="bg-white border-8 border-black p-8 shadow-brutal animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-300 rounded"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!campaign || typeof campaign !== 'object' || !('name' in campaign)) return null

  const typedCampaign = campaign as {
    name: string
    advertiser: string
    adContentHash: string
    budget: bigint
    spent: bigint
    startTime: bigint
    endTime: bigint
    totalViews: bigint
    targetCredentials: number[]
  }

  const adContent = decodeAdContent(typedCampaign.adContentHash)
  const budget = formatMocaAmount(typedCampaign.budget)
  const spent = formatMocaAmount(typedCampaign.spent)
  const remaining = formatMocaAmount(typedCampaign.budget - typedCampaign.spent)
  const startDate = new Date(Number(typedCampaign.startTime) * 1000).toLocaleDateString()
  const endDate = new Date(Number(typedCampaign.endTime) * 1000).toLocaleDateString()

  return (
    <div className="bg-white border-8 border-black p-8 shadow-brutal">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black uppercase">{typedCampaign.name}</h3>
                <span className="px-3 py-1 text-sm font-bold text-white border-2 border-black bg-green-500 uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="font-mono text-lg">{adContent.description}</p>
              <div className="text-sm font-mono text-gray-600">
                By: {typedCampaign.advertiser.slice(0, 6)}...{typedCampaign.advertiser.slice(-4)} |
                Type: {adContent.adType} |
                Duration: {startDate} - {endDate}
              </div>
              {typedCampaign.targetCredentials.length > 0 && (
                <div className="text-sm font-mono text-blue-600">
                  Targeting: {typedCampaign.targetCredentials.map((cred: any) => credentialTypeNames[cred as keyof typeof credentialTypeNames]).join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 border-4 border-black p-4">
              <div className="text-xl font-black">{parseFloat(budget).toFixed(3)} MOCA</div>
              <div className="text-sm font-mono">Budget</div>
            </div>
            <div className="bg-gray-100 border-4 border-black p-4">
              <div className="text-xl font-black">{parseFloat(spent).toFixed(3)} MOCA</div>
              <div className="text-sm font-mono">Spent</div>
            </div>
            <div className="bg-gray-100 border-4 border-black p-4">
              <div className="text-xl font-black">{typedCampaign.totalViews.toString()}</div>
              <div className="text-sm font-mono">Views</div>
            </div>
            <div className="bg-gray-100 border-4 border-black p-4">
              <div className="text-xl font-black">{parseFloat(remaining).toFixed(3)} MOCA</div>
              <div className="text-sm font-mono">Remaining</div>
            </div>
          </div>

          <div className="flex gap-4">
            {adContent.targetUrl && adContent.targetUrl !== "#" && (
              <Link
                href={adContent.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                VISIT SITE
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {adContent.imageUrl && adContent.imageUrl !== "/placeholder.svg" && (
            <div className="bg-gray-100 border-4 border-black p-4">
              <img
                src={adContent.imageUrl}
                alt={typedCampaign.name}
                className="w-full h-32 object-cover border-2 border-black"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}
          <div className="bg-black text-white border-4 border-black p-4">
            <div className="text-sm font-mono uppercase mb-2">Campaign Progress</div>
            <div className="bg-gray-700 h-4 border-2 border-white">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (Number(typedCampaign.spent) / Number(typedCampaign.budget)) * 100)}%`
                }}
              ></div>
            </div>
            <div className="text-xs font-mono mt-1">
              {((Number(typedCampaign.spent) / Number(typedCampaign.budget)) * 100).toFixed(1)}% Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AllAdsPage() {
  const { data: activeCampaignIds, isLoading } = useActiveCampaigns()
  const [searchTerm, setSearchTerm] = useState("")

  // Filter campaign IDs based on search (simplified)
  const filteredCampaignIds = useMemo(() => {
    if (!Array.isArray(activeCampaignIds)) return []

    // For now, just return all campaigns since we can't search by name without fetching all data
    // In a production app, you'd implement server-side search or indexing
    return activeCampaignIds
  }, [activeCampaignIds])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b-8 border-black bg-primary">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <div className="h-12 w-12 bg-yellow-500 border-4 border-black rotate-12"></div>
              <div className="h-12 w-12 bg-blue-600 border-4 border-black -ml-6 -rotate-12"></div>
              <span className="font-black text-2xl tracking-tighter ml-4 text-white">MOCA ADS</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/create"
              className="bg-yellow-500 border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
            >
              CREATE AD
            </Link>
            <Link
              href="/"
              className="bg-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              BACK
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter uppercase">ALL ADS</h1>
            <p className="text-xl font-mono">Browse active advertising campaigns on the network</p>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">
                  {isLoading ? '...' : (Array.isArray(activeCampaignIds) ? activeCampaignIds.length : 0)}
                </div>
                <div className="text-sm font-mono uppercase">Active Campaigns</div>
              </div>
            </div>
            <div className="bg-blue-600 text-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">Live</div>
                <div className="text-sm font-mono uppercase">Real-time Data</div>
              </div>
            </div>
            <div className="bg-yellow-500 border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">On-Chain</div>
                <div className="text-sm font-mono uppercase">Verified</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white border-8 border-black p-6 shadow-brutal">
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase">Search Campaigns</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search functionality coming soon..."
                  className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600 pl-12"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-2xl font-black">Loading campaigns...</div>
              </div>
            ) : !Array.isArray(activeCampaignIds) || activeCampaignIds.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-2xl font-black mb-4">No active campaigns found</div>
                <Link
                  href="/create"
                  className="bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-block"
                >
                  CREATE FIRST CAMPAIGN
                </Link>
              </div>
            ) : (
              filteredCampaignIds.map((campaignId) => (
                <CampaignCard key={campaignId.toString()} campaignId={campaignId} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
