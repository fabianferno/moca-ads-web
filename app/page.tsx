"use client"

import Link from "next/link"
import { ArrowRight, Zap, Shield, Globe, Coins } from "lucide-react"
import { Header } from "@/components/Header"
import { useActiveCampaigns, useRegisteredDomains, useContractBalance, formatMocaAmount } from "@/components/hooks/useMocaAds"

function LiveStats() {
  const { data: activeCampaigns, isLoading: campaignsLoading } = useActiveCampaigns()
  const { data: registeredDomains, isLoading: domainsLoading } = useRegisteredDomains()
  const { data: contractBalance, isLoading: balanceLoading } = useContractBalance()

  const activeCampaignCount = Array.isArray(activeCampaigns) ? activeCampaigns.length : 0
  const publisherCount = Array.isArray(registeredDomains) ? registeredDomains.length : 0
  const totalRewards = contractBalance && typeof contractBalance === 'bigint' ? formatMocaAmount(contractBalance) : '0'

  return (
    <div className="bg-black border-8 border-black p-8 shadow-brutal-inverse">
      <div className="space-y-6">
        <div className="bg-yellow-500 border-4 border-white p-6">
          <h3 className="text-2xl font-black uppercase">LIVE STATS</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-white">
          <div className="bg-blue-600 border-4 border-white p-4">
            <div className="text-3xl font-black">
              {campaignsLoading ? '...' : activeCampaignCount}
            </div>
            <div className="text-sm font-mono">ACTIVE ADS</div>
          </div>
          <div className="bg-red-600 border-4 border-white p-4">
            <div className="text-3xl font-black">
              {domainsLoading ? '...' : publisherCount}
            </div>
            <div className="text-sm font-mono">PUBLISHERS</div>
          </div>
          <div className="bg-cyan-400 text-black border-4 border-white p-4">
            <div className="text-3xl font-black">
              {balanceLoading ? '...' : `${parseFloat(totalRewards).toFixed(2)} MOCA`}
            </div>
            <div className="text-sm font-mono">TOTAL REWARDS</div>
          </div>
          <div className="bg-fuchsia-500 border-4 border-white p-4">
            <div className="text-3xl font-black">99.9%</div>
            <div className="text-sm font-mono">UPTIME</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {


  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container py-24">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">
                  MOCA's OPEN
                  <br />
                  <span className="text-blue-600">ADVERTISING</span>
                  <br />
                  PROTOCOL
                </h1>
                <p className="text-2xl font-mono">
                  Connect advertisers directly with publishers. No middlemen. Pure web3. <br />
                  <span className="text-blue-600 font-bold text-3xl hover:text-red-600 transition-all hover:underline cursor-pointer">Monetize your credentials.</span>
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/create"
                  className="bg-red-600 text-white border-4 border-black px-8 py-4 font-bold text-xl shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                >
                  START ADVERTISING
                  <ArrowRight className="h-6 w-6" />
                </Link>
                <Link
                  href="/register"
                  className="bg-white border-4 border-black px-8 py-4 font-bold text-xl shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                >
                  REGISTER PROPERTY
                </Link>
              </div>
            </div>

            <LiveStats />
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24">
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black tracking-tighter uppercase">WHY CHOOSE MOCA ADS?</h2>
              <p className="text-xl font-mono max-w-2xl mx-auto">
                Revolutionary advertising protocol built on blockchain technology
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white border-8 border-black p-8 shadow-brutal">
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-red-600 border-4 border-black flex items-center justify-center">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black uppercase">INSTANT PAYMENTS</h3>
                  <p className="font-mono">Smart contracts ensure instant, transparent payments to publishers</p>
                </div>
              </div>

              <div className="bg-blue-600 text-white border-8 border-black p-8 shadow-brutal">
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-white border-4 border-black flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black uppercase">FRAUD PROOF</h3>
                  <p className="font-mono">Blockchain verification eliminates ad fraud and fake impressions</p>
                </div>
              </div>

              <div className="bg-yellow-500 border-8 border-black p-8 shadow-brutal">
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-black border-4 border-black flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black uppercase">GLOBAL REACH</h3>
                  <p className="font-mono">Decentralized network reaches audiences worldwide without borders</p>
                </div>
              </div>

              <div className="bg-black text-white border-8 border-black p-8 shadow-brutal-inverse">
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-cyan-400 border-4 border-white flex items-center justify-center">
                    <Coins className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-black uppercase">TOKEN REWARDS</h3>
                  <p className="font-mono">Earn native tokens for quality ad placements and engagement</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container py-24">
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black tracking-tighter uppercase">HOW IT WORKS</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white border-8 border-black p-8 shadow-brutal">
                <div className="space-y-6">
                  <div className="h-20 w-20 bg-red-600 border-4 border-black flex items-center justify-center mx-auto">
                    <span className="text-3xl font-black text-white">1</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase text-center">CREATE ADS</h3>
                  <p className="font-mono text-center">Advertisers create campaigns with smart contract escrow</p>
                </div>
              </div>

              <div className="bg-blue-600 text-white border-8 border-black p-8 shadow-brutal">
                <div className="space-y-6">
                  <div className="h-20 w-20 bg-white border-4 border-black flex items-center justify-center mx-auto">
                    <span className="text-3xl font-black text-blue-600">2</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase text-center">VERIFY PROPERTIES</h3>
                  <p className="font-mono text-center">Publishers verify domain ownership via DNS records</p>
                </div>
              </div>

              <div className="bg-yellow-500 border-8 border-black p-8 shadow-brutal">
                <div className="space-y-6">
                  <div className="h-20 w-20 bg-black border-4 border-black flex items-center justify-center mx-auto">
                    <span className="text-3xl font-black text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase text-center">EARN REWARDS</h3>
                  <p className="font-mono text-center">Automatic payouts based on verified impressions and clicks</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24">
          <div className="bg-black text-white border-8 border-black p-16 shadow-brutal-inverse text-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-black tracking-tighter uppercase">READY TO START?</h2>
              <p className="text-xl font-mono max-w-2xl mx-auto">
                Join the future of advertising. No fees, no middlemen, just pure decentralized value.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/create"
                  className="bg-red-600 text-white border-4 border-white px-8 py-4 font-bold text-xl shadow-brutal-white hover:translate-y-1 hover:shadow-none transition-all"
                >
                  CREATE YOUR FIRST AD
                </Link>
                <Link
                  href="/register"
                  className="bg-yellow-500 text-black border-4 border-white px-8 py-4 font-bold text-xl shadow-brutal-white hover:translate-y-1 hover:shadow-none transition-all"
                >
                  REGISTER PROPERTY
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
