"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, ExternalLink, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock data for all ads
const mockAllAds = [
  {
    id: 1,
    title: "Revolutionary DeFi Platform",
    description:
      "Join the future of decentralized finance with our cutting-edge platform offering yield farming, staking, and liquidity mining.",
    targetUrl: "https://defi-platform.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.5",
    impressions: 12450,
    clicks: 234,
    ctr: "1.88%",
    adType: "banner",
    category: "DeFi",
    advertiser: "0x1234...5678",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "NFT Marketplace Launch",
    description:
      "Discover unique digital assets on our new NFT marketplace. Buy, sell, and trade exclusive NFTs from top creators.",
    targetUrl: "https://nft-market.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.3",
    impressions: 8920,
    clicks: 156,
    ctr: "1.75%",
    adType: "square",
    category: "NFT",
    advertiser: "0xabcd...efgh",
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    title: "Web3 Gaming Revolution",
    description:
      "Play-to-earn games that reward real cryptocurrency. Battle, build, and earn in our immersive gaming metaverse.",
    targetUrl: "https://web3-games.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.8",
    impressions: 15240,
    clicks: 289,
    ctr: "1.90%",
    adType: "skyscraper",
    category: "Gaming",
    advertiser: "0x9876...5432",
    createdAt: "2024-01-20",
  },
  {
    id: 4,
    title: "Crypto Trading Bot",
    description:
      "Automated trading strategies powered by AI. Maximize your profits with our advanced algorithmic trading platform.",
    targetUrl: "https://crypto-bot.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.4",
    impressions: 9850,
    clicks: 198,
    ctr: "2.01%",
    adType: "banner",
    category: "Trading",
    advertiser: "0x5555...7777",
    createdAt: "2024-01-18",
  },
  {
    id: 5,
    title: "Decentralized Social Network",
    description:
      "Own your data, control your content. Join the first truly decentralized social media platform built on blockchain.",
    targetUrl: "https://social-web3.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.6",
    impressions: 11200,
    clicks: 167,
    ctr: "1.49%",
    adType: "square",
    category: "Social",
    advertiser: "0x2222...8888",
    createdAt: "2024-01-12",
  },
  {
    id: 6,
    title: "Blockchain Education Platform",
    description:
      "Learn blockchain development from industry experts. Comprehensive courses on Solidity, Web3, and DApp development.",
    targetUrl: "https://blockchain-edu.com",
    imageUrl: "/placeholder.svg?height=200&width=400",
    budget: "0.35",
    impressions: 7650,
    clicks: 145,
    ctr: "1.90%",
    adType: "banner",
    category: "Education",
    advertiser: "0x3333...9999",
    createdAt: "2024-01-08",
  },
]

export default function AllAdsPage() {
  const [ads, setAds] = useState(mockAllAds)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const categories = ["all", "DeFi", "NFT", "Gaming", "Trading", "Social", "Education"]

  const filteredAds = ads
    .filter(
      (ad) =>
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((ad) => selectedCategory === "all" || ad.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "budget":
          return Number.parseFloat(b.budget) - Number.parseFloat(a.budget)
        case "impressions":
          return b.impressions - a.impressions
        case "ctr":
          return Number.parseFloat(b.ctr) - Number.parseFloat(a.ctr)
        default:
          return 0
      }
    })

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

          {/* Filters */}
          <div className="bg-white border-8 border-black p-8 shadow-brutal">
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">FILTERS & SEARCH</h2>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-lg font-bold">SEARCH</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search ads..."
                      className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600 pl-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-bold">CATEGORY</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border-4 border-black h-14 text-lg font-mono shadow-brutal focus:ring-0 focus:ring-offset-0 focus:border-blue-600 bg-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-bold">SORT BY</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border-4 border-black h-14 text-lg font-mono shadow-brutal focus:ring-0 focus:ring-offset-0 focus:border-blue-600 bg-white"
                  >
                    <option value="newest">NEWEST FIRST</option>
                    <option value="oldest">OLDEST FIRST</option>
                    <option value="budget">HIGHEST BUDGET</option>
                    <option value="impressions">MOST IMPRESSIONS</option>
                    <option value="ctr">HIGHEST CTR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-blue-600 text-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{filteredAds.length}</div>
                <div className="text-sm font-mono uppercase">Active Campaigns</div>
              </div>
            </div>
            <div className="bg-yellow-500 border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">
                  {filteredAds.reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}
                </div>
                <div className="text-sm font-mono uppercase">Total Impressions</div>
              </div>
            </div>
            <div className="bg-red-600 text-white border-8 border-black p-6 shadow-brutal">
              <div className="space-y-2">
                <div className="text-3xl font-black">{filteredAds.reduce((sum, ad) => sum + ad.clicks, 0)}</div>
                <div className="text-sm font-mono uppercase">Total Clicks</div>
              </div>
            </div>
            <div className="bg-black text-white border-8 border-black p-6 shadow-brutal-inverse">
              <div className="space-y-2">
                <div className="text-3xl font-black">
                  {filteredAds.reduce((sum, ad) => sum + Number.parseFloat(ad.budget), 0).toFixed(2)} ETH
                </div>
                <div className="text-sm font-mono uppercase">Total Budget</div>
              </div>
            </div>
          </div>

          {/* Ads Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {filteredAds.map((ad) => (
              <div key={ad.id} className="bg-white border-8 border-black shadow-brutal overflow-hidden">
                <div className="bg-gray-100 border-b-4 border-black p-4">
                  <img
                    src={ad.imageUrl || "/placeholder.svg"}
                    alt={ad.title}
                    className="w-full h-48 object-cover border-4 border-black"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-black uppercase leading-tight">{ad.title}</h3>
                      <span className="bg-blue-600 text-white px-3 py-1 text-sm font-bold border-2 border-black uppercase">
                        {ad.category}
                      </span>
                    </div>
                    <p className="font-mono text-lg">{ad.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 border-4 border-black p-3">
                      <div className="text-lg font-black">{ad.budget} ETH</div>
                      <div className="text-sm font-mono">Budget</div>
                    </div>
                    <div className="bg-gray-100 border-4 border-black p-3">
                      <div className="text-lg font-black">{ad.impressions.toLocaleString()}</div>
                      <div className="text-sm font-mono">Impressions</div>
                    </div>
                    <div className="bg-gray-100 border-4 border-black p-3">
                      <div className="text-lg font-black">{ad.clicks}</div>
                      <div className="text-sm font-mono">Clicks</div>
                    </div>
                    <div className="bg-gray-100 border-4 border-black p-3">
                      <div className="text-lg font-black">{ad.ctr}</div>
                      <div className="text-sm font-mono">CTR</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-mono">
                      <span className="font-bold">Advertiser:</span> {ad.advertiser}
                    </div>
                    <div className="text-sm font-mono">
                      <span className="font-bold">Created:</span> {ad.createdAt}
                    </div>
                    <div className="text-sm font-mono">
                      <span className="font-bold">Ad Type:</span> {ad.adType}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-red-600 text-white border-4 border-black px-4 py-3 font-bold text-center shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center justify-center gap-2"
                    >
                      VISIT SITE
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button className="bg-yellow-500 border-4 border-black px-4 py-3 font-bold shadow-brutal hover:translate-y-1 hover:shadow-none transition-all">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAds.length === 0 && (
            <div className="bg-white border-8 border-black p-16 shadow-brutal text-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase">NO ADS FOUND</h3>
                <p className="text-xl font-mono">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
