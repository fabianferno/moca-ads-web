"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Check, Globe, Shield, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccount } from "wagmi"
import { useRegisterWebsite, useWebsite } from "@/components/hooks/useMocaAds"
import { toast } from "sonner"

export default function RegisterPropertyPage() {
  const { address, isConnected } = useAccount()
  const { registerWebsite, isPending, isConfirming, isSuccess, error } = useRegisterWebsite()

  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState("")
  const [txtRecord, setTxtRecord] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [copied, setCopied] = useState(false)

  // Check if domain is already registered
  const { data: existingWebsite } = useWebsite(domain)

  useEffect(() => {
    if (isSuccess) {
      toast.success("Website registered successfully!")
      setIsVerified(true)
      setStep(3)
    }
  }, [isSuccess])

  useEffect(() => {
    if (error) {
      toast.error(`Error registering website: ${error.message}`)
      setIsVerifying(false)
    }
  }, [error])

  const generateTxtRecord = () => {
    if (!domain) {
      toast.error("Please enter a domain first")
      return
    }

    if (existingWebsite && typeof existingWebsite === 'object' && 'owner' in existingWebsite && existingWebsite.owner !== "0x0000000000000000000000000000000000000000") {
      toast.error("This domain is already registered")
      return
    }

    const record = `moca-ads-verify=${Math.random().toString(36).substring(2, 15)}-${Date.now()}`
    setTxtRecord(record)
    setStep(2)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(txtRecord)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verifyDomain = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsVerifying(true)

    // In a real implementation, you would verify the DNS TXT record here
    // For now, we'll simulate DNS verification and then register
    try {
      // Simulate DNS verification delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Extract clean domain name
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]

      // Register the website on the blockchain
      registerWebsite(cleanDomain)
    } catch (err) {
      setIsVerifying(false)
      toast.error("DNS verification failed. Please ensure the TXT record is properly set.")
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
              <span className="font-black text-2xl tracking-tighter ml-4 text-white">MOCA ADS</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
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
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter uppercase">REGISTER PROPERTY</h1>
              <p className="text-xl font-mono">
                Verify domain ownership to earn rewards from ads displayed on your site
              </p>
            </div>

            {/* Progress Steps */}
            <div className="bg-white border-8 border-black p-8 shadow-brutal">
              <div className="flex items-center justify-between mb-8">
                <div className={`flex items-center gap-4 ${step >= 1 ? "text-black" : "text-gray-400"}`}>
                  <div
                    className={`h-12 w-12 border-4 border-black flex items-center justify-center font-black text-xl ${step >= 1 ? "bg-red-600 text-white" : "bg-gray-200"}`}
                  >
                    1
                  </div>
                  <span className="font-bold text-lg">ENTER DOMAIN</span>
                </div>
                <div className={`flex items-center gap-4 ${step >= 2 ? "text-black" : "text-gray-400"}`}>
                  <div
                    className={`h-12 w-12 border-4 border-black flex items-center justify-center font-black text-xl ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    2
                  </div>
                  <span className="font-bold text-lg">ADD DNS RECORD</span>
                </div>
                <div className={`flex items-center gap-4 ${step >= 3 ? "text-black" : "text-gray-400"}`}>
                  <div
                    className={`h-12 w-12 border-4 border-black flex items-center justify-center font-black text-xl ${step >= 3 ? "bg-green-600 text-white" : "bg-gray-200"}`}
                  >
                    3
                  </div>
                  <span className="font-bold text-lg">VERIFIED</span>
                </div>
              </div>

              {/* Step 1: Enter Domain */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black uppercase border-b-4 border-black pb-2">
                    STEP 1: ENTER YOUR DOMAIN
                  </h2>
                  <p className="text-lg font-mono">
                    Enter the domain where you want to display ads and earn rewards. We'll generate a unique TXT record
                    for verification.
                  </p>

                  <div className="space-y-4">
                    <Label htmlFor="domain" className="text-lg font-bold">
                      DOMAIN NAME
                    </Label>
                    <Input
                      id="domain"
                      type="url"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="https://your-website.com"
                      className="border-4 border-black h-16 text-xl font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                    />
                  </div>

                  <button
                    onClick={generateTxtRecord}
                    disabled={!domain}
                    className="bg-red-600 text-white border-4 border-black px-8 py-4 font-bold text-xl shadow-brutal hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    GENERATE TXT RECORD
                  </button>
                </div>
              )}

              {/* Step 2: Add DNS Record */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black uppercase border-b-4 border-black pb-2">
                    STEP 2: ADD DNS TXT RECORD
                  </h2>
                  <p className="text-lg font-mono">
                    Add the following TXT record to your domain's DNS settings to verify ownership.
                  </p>

                  <div className="bg-black text-white border-4 border-black p-6 shadow-brutal-inverse">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                        <div>
                          <div className="text-gray-400 uppercase">Type</div>
                          <div className="text-xl font-bold">TXT</div>
                        </div>
                        <div>
                          <div className="text-gray-400 uppercase">Name</div>
                          <div className="text-xl font-bold">@</div>
                        </div>
                        <div>
                          <div className="text-gray-400 uppercase">TTL</div>
                          <div className="text-xl font-bold">3600</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 uppercase text-sm">Value</div>
                        <div className="bg-gray-800 border-2 border-white p-4 mt-2 flex items-center justify-between">
                          <code className="text-yellow-400 font-mono break-all">{txtRecord}</code>
                          <button
                            onClick={copyToClipboard}
                            className="bg-yellow-500 text-black border-2 border-white px-3 py-1 font-bold text-sm ml-4 flex items-center gap-2"
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? "COPIED" : "COPY"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500 border-4 border-black p-6">
                    <h3 className="text-xl font-black uppercase mb-4">INSTRUCTIONS:</h3>
                    <ol className="space-y-2 font-mono text-lg">
                      <li>1. Log into your domain registrar or DNS provider</li>
                      <li>2. Navigate to DNS management section</li>
                      <li>3. Add a new TXT record with the values above</li>
                      <li>4. Save changes and wait for propagation (up to 24 hours)</li>
                      <li>5. Click "VERIFY DOMAIN" below to check</li>
                    </ol>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      BACK
                    </button>
                    <button
                      onClick={verifyDomain}
                      disabled={isVerifying || isPending || isConfirming || !isConnected}
                      className="bg-blue-600 text-white border-4 border-black px-8 py-4 font-bold text-xl shadow-brutal hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex-1"
                    >
                      {isVerifying ? "VERIFYING DNS..." : isPending ? "CONFIRMING..." : isConfirming ? "REGISTERING..." : "VERIFY DOMAIN"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Verified */}
              {step === 3 && isVerified && (
                <div className="space-y-6 text-center">
                  <div className="space-y-4">
                    <div className="h-24 w-24 bg-green-600 border-4 border-black flex items-center justify-center mx-auto">
                      <Check className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-black uppercase">DOMAIN VERIFIED!</h2>
                    <p className="text-lg font-mono">
                      Congratulations! Your domain {domain} has been successfully verified.
                    </p>
                  </div>

                  <div className="bg-black text-white border-4 border-black p-8 shadow-brutal-inverse">
                    <h3 className="text-2xl font-black uppercase border-b-4 border-white pb-2 mb-6">WHAT'S NEXT?</h3>
                    <div className="grid gap-6 md:grid-cols-3 text-left">
                      <div className="space-y-3">
                        <div className="h-12 w-12 bg-red-600 border-2 border-white flex items-center justify-center">
                          <Globe className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-lg font-bold uppercase">INTEGRATE AD CODE</h4>
                        <p className="font-mono text-sm">
                          Add our JavaScript snippet to your website to start displaying ads.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="h-12 w-12 bg-blue-600 border-2 border-white flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-lg font-bold uppercase">QUALITY CONTROL</h4>
                        <p className="font-mono text-sm">
                          Our system will review your site for quality and compliance.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="h-12 w-12 bg-yellow-500 border-2 border-white flex items-center justify-center">
                          <Coins className="h-6 w-6 text-black" />
                        </div>
                        <h4 className="text-lg font-bold uppercase">EARN REWARDS</h4>
                        <p className="font-mono text-sm">
                          Start earning cryptocurrency for every verified ad impression.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-4 border-black p-6">
                    <h3 className="text-xl font-black uppercase mb-4">INTEGRATION CODE</h3>
                    <div className="bg-gray-100 border-2 border-black p-4 font-mono text-sm">
                      <code>{`<script src="https://cdn.mocaads.com/ads.js"></script>
<script>
  MocaAds.init({
    domain: "${domain}",
    verification: "${txtRecord.split("=")[1]}"
  });
</script>`}</code>
                    </div>
                    <p className="font-mono text-sm mt-4">
                      Add this code to your website's &lt;head&gt; section to start displaying ads.
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Link
                      href="/ads"
                      className="bg-blue-600 text-white border-4 border-black px-8 py-4 font-bold text-xl shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      BROWSE ADS
                    </Link>
                    <Link
                      href="/create"
                      className="bg-red-600 text-white border-4 border-black px-8 py-4 font-bold text-xl shadow-brutal hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      CREATE AD
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Benefits Section */}
            {step < 3 && (
              <div className="grid gap-8 md:grid-cols-3">
                <div className="bg-red-600 text-white border-8 border-black p-8 shadow-brutal">
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-white border-4 border-black flex items-center justify-center">
                      <Coins className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-black uppercase">EARN CRYPTO</h3>
                    <p className="font-mono">
                      Get paid in cryptocurrency for every verified ad impression on your website.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-600 text-white border-8 border-black p-8 shadow-brutal">
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-white border-4 border-black flex items-center justify-center">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-black uppercase">NO FRAUD</h3>
                    <p className="font-mono">
                      Blockchain verification ensures all impressions are real and payments are guaranteed.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-500 border-8 border-black p-8 shadow-brutal">
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-black border-4 border-black flex items-center justify-center">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase">GLOBAL REACH</h3>
                    <p className="font-mono">
                      Connect with advertisers worldwide through our decentralized ad network.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
