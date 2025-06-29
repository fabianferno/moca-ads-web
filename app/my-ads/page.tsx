"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Play, Pause } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock data
const mockAds = [
  {
    id: 1,
    title: "Revolutionary DeFi Platform",
    description: "Join the future of decentralized finance with our cutting-edge platform",
    targetUrl: "https://defi-platform.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.5",
    spent: "0.23",
    impressions: 12450,
    clicks: 234,
    status: "active",
    adType: "banner",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "NFT Marketplace Launch",
    description: "Discover unique digital assets on our new NFT marketplace",
    targetUrl: "https://nft-market.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.3",
    spent: "0.3",
    impressions: 8920,
    clicks: 156,
    status: "completed",
    adType: "square",
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    title: "Web3 Gaming Revolution",
    description: "Play-to-earn games that reward real cryptocurrency",
    targetUrl: "https://web3-games.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.8",
    spent: "0.12",
    impressions: 3240,
    clicks: 89,
    status: "paused",
    adType: "skyscraper",
    createdAt: "2024-01-20",
  },
]

export default function MyAdsPage() {
  const [ads, setAds] = useState(mockAds)
  const [editingAd, setEditingAd] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEdit = (ad: any) => {
    setEditingAd({ ...ad })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    setAds(ads.map((ad) => (ad.id === editingAd.id ? editingAd : ad)))
    setShowEditModal(false)
    setEditingAd(null)
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this ad? This action cannot be undone.")) {
      setAds(ads.filter((ad) => ad.id !== id))
    }
  }

  const toggleAdStatus = (id: number) => {
    setAds(ads.map((ad) => (ad.id === id ? { ...ad, status: ad.status === "active" ? "paused" : "active" } : ad)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b-8 border-black bg-primary">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <div className="h-12 w-12 bg-yellow-500 border-4 border-black rotate-12"></div>
              <div className="h-12 w-12 bg-blue-600 border-4 border-black -ml-6 -rotate-12"></div>
              <span className="font-black text-2xl tracking-tighter ml-4 text-white">ADBLOCK3</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/create"
              className="bg-yellow-500 border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
            >
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
            <p className="text-xl font-mono">Manage your advertising campaigns</p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{ads.length}</div>
                <div className="text-sm font-mono uppercase">Total Campaigns</div>
              </div>
            </div>
            <div className="bg-blue-600 text-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{ads.filter((ad) => ad.status === "active").length}</div>
                <div className="text-sm font-mono uppercase">Active Campaigns</div>
              </div>
            </div>
            <div className="bg-yellow-500 border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">
                  {ads.reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}
                </div>
                <div className="text-sm font-mono uppercase">Total Impressions</div>
              </div>
            </div>
            <div className="bg-red-600 text-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{ads.reduce((sum, ad) => sum + ad.clicks, 0)}</div>
                <div className="text-sm font-mono uppercase">Total Clicks</div>
              </div>
            </div>
          </div>

          {/* Ads List */}
          <div className="space-y-6">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white border-8 border-black p-8 shadow-brutal">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-2xl font-black uppercase">{ad.title}</h3>
                          <span
                            className={`px-3 py-1 text-sm font-bold text-white border-2 border-black ${getStatusColor(ad.status)} uppercase`}
                          >
                            {ad.status}
                          </span>
                        </div>
                        <p className="font-mono text-lg">{ad.description}</p>
                        <div className="text-sm font-mono text-gray-600">
                          Target: {ad.targetUrl} | Type: {ad.adType} | Created: {ad.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-100 border-4 border-black p-4">
                        <div className="text-xl font-black">{ad.budget} ETH</div>
                        <div className="text-sm font-mono">Budget</div>
                      </div>
                      <div className="bg-gray-100 border-4 border-black p-4">
                        <div className="text-xl font-black">{ad.spent} ETH</div>
                        <div className="text-sm font-mono">Spent</div>
                      </div>
                      <div className="bg-gray-100 border-4 border-black p-4">
                        <div className="text-xl font-black">{ad.impressions.toLocaleString()}</div>
                        <div className="text-sm font-mono">Impressions</div>
                      </div>
                      <div className="bg-gray-100 border-4 border-black p-4">
                        <div className="text-xl font-black">{ad.clicks}</div>
                        <div className="text-sm font-mono">Clicks</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-100 border-4 border-black p-4">
                      <img
                        src={ad.imageUrl || "/placeholder.svg"}
                        alt={ad.title}
                        className="w-full h-32 object-cover border-2 border-black"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAdStatus(ad.id)}
                        className={`flex-1 border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center justify-center gap-2 ${
                          ad.status === "active" ? "bg-yellow-500" : "bg-green-500 text-white"
                        }`}
                        disabled={ad.status === "completed"}
                      >
                        {ad.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {ad.status === "active" ? "PAUSE" : "RESUME"}
                      </button>
                      <button
                        onClick={() => handleEdit(ad)}
                        className="bg-blue-600 text-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="bg-red-600 text-white border-4 border-black px-4 py-2 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ads.length === 0 && (
            <div className="bg-white border-8 border-black p-16 shadow-brutal text-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase">NO ADS YET</h3>
                <p className="text-xl font-mono">Create your first advertising campaign to get started</p>
                <Link
                  href="/create"
                  className="bg-red-600 text-white border-4 border-black px-8 py-4 font-bold text-xl shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-block"
                >
                  CREATE YOUR FIRST AD
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-8 border-black shadow-brutal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-black text-white p-4 border-b-4 border-black">
              <h2 className="text-2xl font-black uppercase">EDIT AD CAMPAIGN</h2>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-lg font-bold">
                    AD TITLE
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingAd.title}
                    onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                    className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-lg font-bold">
                    DESCRIPTION
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingAd.description}
                    onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                    className="border-4 border-black text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-targetUrl" className="text-lg font-bold">
                    TARGET URL
                  </Label>
                  <Input
                    id="edit-targetUrl"
                    value={editingAd.targetUrl}
                    onChange={(e) => setEditingAd({ ...editingAd, targetUrl: e.target.value })}
                    className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-budget" className="text-lg font-bold">
                    BUDGET (ETH)
                  </Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    step="0.001"
                    value={editingAd.budget}
                    onChange={(e) => setEditingAd({ ...editingAd, budget: e.target.value })}
                    className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                >
                  SAVE CHANGES
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
