"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2 } from "lucide-react"

interface CampaignEditorProps {
  campaign?: Record<string, unknown>
  onSave?: (campaign: Record<string, unknown>) => void
}

export function CampaignEditor({ campaign, onSave }: CampaignEditorProps) {
  const [name, setName] = useState((campaign?.name as string) || "")
  const [type, setType] = useState((campaign?.type as string) || "whatsapp")
  const [division, setDivision] = useState((campaign?.division as string) || "marine")
  const [message, setMessage] = useState((campaign?.message_template as string) || "")
  const [subject, setSubject] = useState((campaign?.subject as string) || "")
  const [scheduledAt, setScheduledAt] = useState((campaign?.scheduled_at as string) || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const body = { name, type, division, message_template: message, subject, scheduled_at: scheduledAt || undefined }

      const url = campaign?.id ? `/api/campaigns/${campaign.id}` : "/api/campaigns"
      const method = campaign?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (onSave) onSave(data.campaign)
    } catch (error) {
      console.error("Error saving campaign:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 space-y-4">
      <h3 className="font-clash text-lg font-semibold text-text-primary">
        {campaign ? "Edit Campaign" : "Create Campaign"}
      </h3>

      <div>
        <Label>Campaign Name</Label>
        <Input placeholder="e.g., March Solar Promotion" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="broadcast">Broadcast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Division</Label>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="marine">Marine</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {type === "email" && (
        <div>
          <Label>Email Subject</Label>
          <Input placeholder="Enter email subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
      )}

      <div>
        <Label>Message Template</Label>
        <Textarea
          placeholder="Use {{first_name}}, {{company}}, {{product_interest}} for personalization"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />
      </div>

      <div>
        <Label>Schedule (optional)</Label>
        <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        {campaign ? "Update" : "Create"} Campaign
      </Button>
    </div>
  )
}
