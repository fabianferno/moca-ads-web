"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateCampaign, useMinCampaignBudget, useUserAddress, formatMocaAmount, credentialTypeNames, type CredentialType } from "@/hooks/useMocaAds"
import { toast } from "sonner";
import { Header } from "@/components/Header"

export default function CreateAdPage() {
  const { isConnected } = useUserAddress()
  const { data: minBudget } = useMinCampaignBudget()
  const { createCampaign, isPending, isConfirming, isSuccess, error } = useCreateCampaign()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    budget: "",
    duration: "7", // days
    adType: "banner",
    targeting: {
      countries: "",
      categories: "",
      keywords: "",
    },
    targetCredentials: [] as CredentialType[],
  })

  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      toast.success("Campaign created successfully!")
      // Reset form
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        budget: "",
        duration: "7",
        adType: "banner",
        targeting: {
          countries: "",
          categories: "",
          keywords: "",
        },
        targetCredentials: [],
      })
    }
  }, [isSuccess])

  useEffect(() => {
    if (error) {
      toast.error(`Error creating campaign: ${error.message}`)
    }
  }, [error])

  const handleCredentialToggle = (credential: CredentialType, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        targetCredentials: [...prev.targetCredentials, credential]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        targetCredentials: prev.targetCredentials.filter(c => c !== credential)
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!formData.title || !formData.description || !formData.budget || !formData.duration) {
      toast.error("Please fill in all required fields")
      return
    }

    const minBudgetEth = minBudget && typeof minBudget === 'bigint' ? formatMocaAmount(minBudget) : '0.01'
    if (parseFloat(formData.budget) < parseFloat(minBudgetEth)) {
      toast.error(`Minimum budget is ${minBudgetEth} MOCA`)
      return
    }

    // Create ad content hash (simplified - in production, upload to IPFS)
    const adContent = {
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      adType: formData.adType,
    }
    const adContentHash = btoa(JSON.stringify(adContent)) // Simple base64 encoding

    // Convert duration from days to seconds
    const durationInSeconds = BigInt(parseInt(formData.duration) * 24 * 60 * 60)

    createCampaign(
      formData.title,
      durationInSeconds,
      formData.targetCredentials,
      adContentHash,
      formData.budget
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />
      <main className="container py-12">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter uppercase">CREATE NEW AD</h1>
              <p className="text-xl font-mono">Deploy your advertising campaign on the blockchain</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Form */}
              <div className="bg-white border-8 border-black p-8 shadow-brutal">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Form in Two Columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
                    {/* Left Column */}
                    <div className="space-y-6">

                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-lg font-bold">
                          AD TITLE
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter compelling ad title"
                          className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-lg font-bold">
                          DESCRIPTION
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe your product or service"
                          className="border-4 border-black text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600 min-h-[120px]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-lg font-bold">
                          IMAGE URL
                        </Label>
                        <Input
                          id="imageUrl"
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://your-image.com/banner.jpg"
                          className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                        />
                      </div>

                      <div className="space-y-6">
                        <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">BUDGET & DURATION</h2>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="budget" className="text-lg font-bold">
                              BUDGET (MOCA)
                            </Label>
                            <Input
                              id="budget"
                              type="number"
                              step="0.001"
                              value={formData.budget}
                              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                              placeholder={minBudget && typeof minBudget === 'bigint' ? formatMocaAmount(minBudget) : "0.01"}
                              className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                              required
                            />
                            <p className="text-sm font-mono text-gray-600">
                              Minimum: {minBudget && typeof minBudget === 'bigint' ? formatMocaAmount(minBudget) : '0.01'} MOCA
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration" className="text-lg font-bold">
                              DURATION (DAYS)
                            </Label>
                            <Input
                              id="duration"
                              type="number"
                              value={formData.duration}
                              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                              placeholder="30"
                              className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">AD TYPE</h2>
                        <RadioGroup
                          value={formData.adType}
                          onValueChange={(value) => setFormData({ ...formData, adType: value })}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-4">
                            <RadioGroupItem
                              value="banner"
                              id="banner"
                              className="h-6 w-6 border-4 border-black data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                            />
                            <Label htmlFor="banner" className="text-lg font-mono">
                              Banner Ad (728x90)
                            </Label>
                          </div>
                          <div className="flex items-center gap-4">
                            <RadioGroupItem
                              value="square"
                              id="square"
                              className="h-6 w-6 border-4 border-black data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                            />
                            <Label htmlFor="square" className="text-lg font-mono">
                              Square Ad (300x300)
                            </Label>
                          </div>
                          <div className="flex items-center gap-4">
                            <RadioGroupItem
                              value="skyscraper"
                              id="skyscraper"
                              className="h-6 w-6 border-4 border-black data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                            />
                            <Label htmlFor="skyscraper" className="text-lg font-mono">
                              Skyscraper (160x600)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-6">
                        <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">TARGET CREDENTIALS</h2>
                        <p className="font-mono text-sm text-gray-600">
                          Select user credentials to target (optional). Leave empty to target all users.
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(credentialTypeNames).map(([value, name]) => {
                            const credentialValue = parseInt(value) as CredentialType
                            return (
                              <div key={value} className="flex items-center space-x-3">
                                <Checkbox
                                  id={`credential-${value}`}
                                  checked={formData.targetCredentials.includes(credentialValue)}
                                  onCheckedChange={(checked) => handleCredentialToggle(credentialValue, checked as boolean)}
                                  className="h-5 w-5 border-4 border-black data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                />
                                <Label htmlFor={`credential-${value}`} className="font-mono text-sm">
                                  {name}
                                </Label>
                              </div>
                            )
                          })}

                          <div className="mt-6 p-4 bg-gray-100 border-4 border-black">
                            <h3 className="text-lg font-black uppercase text-gray-700">MORE CREDENTIALS COMING SOON</h3>
                            <p className="font-mono text-sm text-gray-600">Custom verification, identity, certifications, academic credentials</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setPreview(!preview)}
                      className="bg-yellow-500 border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-2"
                    >
                      <Eye className="h-5 w-5" />
                      {preview ? "HIDE PREVIEW" : "PREVIEW AD"}
                    </button>
                    <button
                      type="submit"
                      disabled={!isConnected || isPending || isConfirming}
                      className="bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? "CONFIRMING..." : isConfirming ? "DEPLOYING..." : "DEPLOY AD CAMPAIGN"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div className="space-y-8">
                <div className="bg-black text-white border-8 border-black p-8 shadow-brutal-inverse">
                  <h2 className="text-2xl font-black uppercase border-b-4 border-white pb-2 mb-6">CAMPAIGN SUMMARY</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-mono">Budget:</span>
                      <span className="font-bold">{formData.budget || "0"} MOCA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">Duration:</span>
                      <span className="font-bold">{formData.duration || "0"} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">Ad Type:</span>
                      <span className="font-bold uppercase">{formData.adType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono">Est. Impressions:</span>
                      <span className="font-bold">
                        {formData.budget ? Math.floor(Number.parseFloat(formData.budget) * 10000) : "0"}
                      </span>
                    </div>
                  </div>
                </div>

                {preview && formData.title && (
                  <div className="bg-white border-8 border-black p-8 shadow-brutal">
                    <h3 className="text-xl font-black uppercase border-b-4 border-black pb-2 mb-6">AD PREVIEW</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-100 border-4 border-black p-6">
                        {formData.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={formData.imageUrl || "/placeholder.svg"}
                              alt="Ad preview"
                              className="w-full h-32 object-cover border-2 border-black"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                        <h4 className="text-lg font-bold mb-2">{formData.title}</h4>
                        <p className="font-mono text-sm mb-4">{formData.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
