"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function CreateAdPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetUrl: "",
    imageUrl: "",
    budget: "",
    duration: "",
    adType: "banner",
    targeting: {
      countries: "",
      categories: "",
      keywords: "",
    },
  })

  const [preview, setPreview] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate ad creation
    alert("Ad created successfully! Smart contract deployed.")
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
              <h1 className="text-5xl font-black tracking-tighter uppercase">CREATE NEW AD</h1>
              <p className="text-xl font-mono">Deploy your advertising campaign on the blockchain</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Form */}
              <div className="bg-white border-8 border-black p-8 shadow-brutal">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">AD DETAILS</h2>

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
                      <Label htmlFor="targetUrl" className="text-lg font-bold">
                        TARGET URL
                      </Label>
                      <Input
                        id="targetUrl"
                        type="url"
                        value={formData.targetUrl}
                        onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                        placeholder="https://your-website.com"
                        className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
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
                  </div>

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
                    <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">BUDGET & DURATION</h2>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-lg font-bold">
                          BUDGET (ETH)
                        </Label>
                        <Input
                          id="budget"
                          type="number"
                          step="0.001"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="0.1"
                          className="border-4 border-black h-14 text-lg font-mono shadow-brutal focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                          required
                        />
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
                      className="bg-red-600 text-white border-4 border-black px-6 py-3 font-bold text-lg shadow-brutal hover:translate-y-1 hover:shadow-none transition-all flex-1"
                    >
                      DEPLOY AD CAMPAIGN
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
                      <span className="font-bold">{formData.budget || "0"} ETH</span>
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
                        <div className="text-xs font-mono text-gray-600">{formData.targetUrl}</div>
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
