"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AdPreview } from "@/components/ugc/ad-preview"
import { Sparkles, Loader2 } from "lucide-react"

const adTypes = [
  { value: "testimonial", label: "Customer Testimonial" },
  { value: "unboxing", label: "Product Unboxing" },
  { value: "installation", label: "Installation Walkthrough" },
  { value: "problem_solution", label: "Problem → Solution" },
  { value: "day_in_life", label: "Day in the Life" },
  { value: "facebook_lead", label: "Facebook Lead Ad" },
  { value: "carousel", label: "Carousel Ad" },
  { value: "story", label: "Story Ad (15s)" },
  { value: "whatsapp_broadcast", label: "WhatsApp Broadcast" },
  { value: "email_blast", label: "Email Blast" },
  { value: "sms_blast", label: "SMS Blast" },
  { value: "google_search", label: "Google Search Ad" },
]

export function AdCreator() {
  const [division, setDivision] = useState("marine")
  const [adType, setAdType] = useState("testimonial")
  const [platform, setPlatform] = useState("instagram")
  const [productId, setProductId] = useState("")
  const [generatedAd, setGeneratedAd] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch("/api/ugc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ division, ad_type: adType, platform, product_id: productId || undefined }),
      })
      const data = await res.json()
      if (data.ad) setGeneratedAd(data.ad)
    } catch (error) {
      console.error("Error generating ad:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 space-y-4">
        <h3 className="font-clash text-lg font-semibold text-text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-primary-glow" />
          Create UGC Ad
        </h3>

        <div>
          <Label>Division</Label>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="marine">Marine Division</SelectItem>
              <SelectItem value="tech">Technology Division</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ad Type</Label>
          <Select value={adType} onValueChange={setAdType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {adTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="google">Google</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Product ID (optional)</Label>
          <Input placeholder="Enter product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate Ad
        </Button>
      </div>

      <div>
        {generatedAd ? (
          <AdPreview
            headline={(generatedAd.headline as string) || ""}
            primaryText={(generatedAd.primary_text as string) || ""}
            ctaButton={(generatedAd.cta_button as string) || ""}
            videoScript={(generatedAd.video_script as string) || ""}
            adType={(generatedAd.ad_type as string) || ""}
            platform={(generatedAd.platform as string) || ""}
          />
        ) : (
          <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Generate an ad to see a preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
