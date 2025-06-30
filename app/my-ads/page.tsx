"use client"

import { useMemo, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Coins } from "lucide-react"
import { useActiveCampaigns, useCampaign, formatMocaAmount, useUserStats, useUserClaimableRewards, useClaimUserRewards, useWithdrawCampaignBudget } from "@/hooks/useMocaAds"
import { toast } from "sonner"
import { useAppContext } from "@/contexts/AppContext"
import { Header } from "@/components/Header"

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

// Component to display user's campaign
function UserCampaignCard({ campaignId }: { campaignId: bigint }) {
  const { data: campaign, isLoading } = useCampaign(campaignId)
  const { userAddress } = useAppContext()
  const { withdrawCampaignBudget, isPending: isWithdrawing } = useWithdrawCampaignBudget()

  if (isLoading) {
    return (
      <div className="bg-white border-8 border-black p-8 shadow-brutal animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-16 bg-gray-300 rounded"></div>
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
    active: boolean
  }

  // Only show campaigns created by the current user
  if (typedCampaign.advertiser.toLowerCase() !== userAddress?.toLowerCase()) {
    return null
  }

  const adContent = decodeAdContent(typedCampaign.adContentHash)
  const budget = formatMocaAmount(typedCampaign.budget)
  const spent = formatMocaAmount(typedCampaign.spent)
  const remaining = formatMocaAmount(typedCampaign.budget - typedCampaign.spent)
  const startDate = new Date(Number(typedCampaign.startTime) * 1000).toLocaleDateString()
  const endDate = new Date(Number(typedCampaign.endTime) * 1000).toLocaleDateString()
  const isExpired = Date.now() > Number(typedCampaign.endTime) * 1000
  const canWithdraw = isExpired && typedCampaign.budget > typedCampaign.spent

  const getStatusColor = (active: boolean, expired: boolean) => {
    if (expired) return "bg-gray-500"
    if (active) return "bg-green-500"
    return "bg-yellow-500"
  }

  const getStatusText = (active: boolean, expired: boolean) => {
    if (expired) return "COMPLETED"
    if (active) return "ACTIVE"
    return "PAUSED"
  }

  const handleWithdraw = () => {
    if (canWithdraw) {
      withdrawCampaignBudget(campaignId)
    }
  }

  return (
    <div className="bg-white border-8 border-black p-8 shadow-brutal">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black uppercase">{typedCampaign.name}</h3>
              <span className={`px-3 py-1 text-sm font-bold text-white border-2 border-black ${getStatusColor(typedCampaign.active, isExpired)} uppercase`}>
                {getStatusText(typedCampaign.active, isExpired)}
              </span>
            </div>
            <p className="font-mono text-lg">{adContent.description}</p>
            <div className="text-sm font-mono text-gray-600">
              Type: {adContent.adType} | Duration: {startDate} - {endDate}
            </div>
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

        {canWithdraw && (
          <div className="flex gap-4">
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="bg-blue-600 text-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            >
              {isWithdrawing ? "WITHDRAWING..." : "WITHDRAW REMAINING"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyAdsPage() {
  const { userAddress, isLoggedIn } = useAppContext()
  const { data: activeCampaignIds, isLoading: campaignsLoading } = useActiveCampaigns()
  const { data: userStats } = useUserStats(userAddress as string)
  const { data: claimableRewards } = useUserClaimableRewards(userAddress as string)
  const { claimUserRewards, isPending: isClaimingRewards, isSuccess: rewardsClaimed } = useClaimUserRewards()

  useEffect(() => {
    if (rewardsClaimed) {
      toast.success("Rewards claimed successfully!")
    }
  }, [rewardsClaimed])

  const handleClaimRewards = () => {
    if (!isLoggedIn) {
      toast.error("Please connect your wallet first")
      return
    }

    claimUserRewards()
  }

  const userCampaignCount = useMemo(() => {
    // This is an approximation since we need to check each campaign's advertiser
    return Array.isArray(activeCampaignIds) ? activeCampaignIds.length : 0
  }, [activeCampaignIds])

  const totalEarnings = userStats && typeof userStats === 'object' && 'totalEarnings' in userStats
    ? formatMocaAmount(userStats.totalEarnings as bigint)
    : '0'

  const totalViews = userStats && typeof userStats === 'object' && 'totalViews' in userStats
    ? (userStats.totalViews as bigint).toString()
    : '0'

  const claimableAmount = claimableRewards && typeof claimableRewards === 'bigint'
    ? formatMocaAmount(claimableRewards)
    : '0'

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <Header />


        <main className="container py-12">
          <div className="text-center py-24">
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-8">CONNECT WALLET</h1>
            <p className="text-xl font-mono mb-8">Connect your wallet to view your advertising campaigns</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />
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
              className="bg-yellow-500 border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              CREATE NEW AD
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
            <h1 className="text-5xl font-black tracking-tighter uppercase">MY ADS</h1>
            <p className="text-xl font-mono">Manage your advertising campaigns and view earnings</p>
          </div>

          {/* User Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{userCampaignCount}</div>
                <div className="text-sm font-mono uppercase">My Campaigns</div>
              </div>
            </div>
            <div className="bg-blue-600 text-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{totalViews}</div>
                <div className="text-sm font-mono uppercase">Total Views</div>
              </div>
            </div>
            <div className="bg-yellow-500 border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{parseFloat(totalEarnings).toFixed(4)} MOCA</div>
                <div className="text-sm font-mono uppercase">Total Earnings</div>
              </div>
            </div>
            <div className="bg-red-600 text-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{parseFloat(claimableAmount).toFixed(4)} MOCA</div>
                <div className="text-sm font-mono uppercase">Claimable</div>
              </div>
            </div>
          </div>

          {/* Claim Rewards Section */}
          {parseFloat(claimableAmount) > 0 && (
            <div className="bg-green-500 border-8 border-black p-6 shadow-brutal">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase">REWARDS AVAILABLE</h3>
                  <p className="font-mono text-lg">You have {parseFloat(claimableAmount).toFixed(4)} MOCA ready to claim</p>
                </div>
                <button
                  onClick={handleClaimRewards}
                  disabled={isClaimingRewards}
                  className="bg-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Coins className="h-5 w-5" />
                  {isClaimingRewards ? "CLAIMING..." : "CLAIM REWARDS"}
                </button>
              </div>
            </div>
          )}

          {/* Campaign List */}
          <div className="space-y-6">
            {campaignsLoading ? (
              <div className="text-center py-12">
                <div className="text-2xl font-black">Loading your campaigns...</div>
              </div>
            ) : !Array.isArray(activeCampaignIds) || activeCampaignIds.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-2xl font-black mb-4">No campaigns found</div>
                <p className="text-lg font-mono mb-8">Create your first advertising campaign to get started</p>
                <Link
                  href="/create"
                  className="bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  CREATE FIRST CAMPAIGN
                </Link>
              </div>
            ) : (
              activeCampaignIds.map((campaignId) => (
                <UserCampaignCard key={campaignId.toString()} campaignId={campaignId as unknown as bigint} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

