import { callClaude } from '@/lib/ai/claude'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export interface QualificationResult {
  grade: 'A' | 'B' | 'C' | 'D'
  score: number
  division_best_fit: 'marine' | 'tech' | 'both' | 'none'
  icp_match: number
  tier: 'hot' | 'warm' | 'cold' | 'disqualified'
  qualification_status: 'qualified' | 'disqualified'
  reasons: string[]
  disqualifiers: string[]
  budget_signal: 'high' | 'medium' | 'low' | 'unknown'
  urgency: 'immediate' | 'this_month' | 'this_quarter' | 'future' | 'unknown'
  decision_maker: boolean
  talking_points: string[]
  recommended_approach: string
  best_channel: 'whatsapp' | 'email' | 'call' | 'sms'
  best_time_to_contact: 'morning' | 'afternoon' | 'evening'
  product_suggestions: string[]
  confidence: number
  notes: string
}

const QUALIFICATION_PROMPT = `You are Roshanal Infotech's lead qualification AI.

ROSHANAL IDEAL CUSTOMER PROFILE (ICP):

Marine Division ICP:
- Boat operators, marine transport companies, oil & gas companies with vessels
- NDDC contractors, fishing companies, dredging companies
- Located in Rivers State, Bayelsa, Delta, Akwa Ibom (Niger Delta region)
- Company with 2+ vessels or individual boat owner who uses boat commercially
- Budget signal: Can afford ₦500,000+ (outboard engine)
- Pain: Unreliable engines, no local genuine parts, compliance requirements

Tech/Security Division ICP:
- Property owners with 3+ bedroom homes in GRA, Eliozu, Rumuola, Woji
- Business owners: hotels (10+ rooms), schools (100+ students), hospitals, banks, fuel stations
- Fleet operators with 5+ vehicles needing GPS tracking
- Offices/warehouses in Trans Amadi, D-Line industrial areas
- Budget signal: ₦200,000+ for basic package
- Pain: Insecurity, armed robbery fear, PHCN outages, vehicle theft

LEAD DATA:
Name: {{lead_name}}
Company: {{company}}
Job Title: {{job_title}}
Location: {{location}}
Source: {{source}}
Phone: {{phone}}
Industry (detected): {{industry}}

INSTRUCTIONS:
Evaluate this lead strictly against both ICP profiles.
Return ONLY valid JSON, no markdown, no explanation:

{
  "grade": "A|B|C|D",
  "score": 0-100,
  "division_best_fit": "marine|tech|both|none",
  "icp_match": 0-100,
  "tier": "hot|warm|cold|disqualified",
  "qualification_status": "qualified|disqualified",
  "reasons": ["reason1", "reason2"],
  "disqualifiers": [],
  "budget_signal": "high|medium|low|unknown",
  "urgency": "immediate|this_month|this_quarter|future|unknown",
  "decision_maker": true|false,
  "talking_points": ["point1", "point2", "point3"],
  "recommended_approach": "one sentence on best way to approach this lead",
  "best_channel": "whatsapp|email|call|sms",
  "best_time_to_contact": "morning|afternoon|evening",
  "product_suggestions": ["product1", "product2"],
  "confidence": 0-100,
  "notes": "AI analyst notes here"
}

GRADING:
A = Perfect ICP match, decision maker, high budget, immediate urgency → Qualify
B = Good ICP match, may not be decision maker, medium budget → Qualify
C = Partial match, uncertain budget → Qualify (lower priority)
D = Poor ICP match, wrong geography, no budget signal → Disqualify`

export async function qualifyLead(leadId: string): Promise<QualificationResult | null> {
  const { data: leadData, error } = await db
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (error || !leadData) return null

  const lead = leadData as unknown as Record<string, unknown>

  const prompt = QUALIFICATION_PROMPT
    .replace('{{lead_name}}', (lead.full_name || lead.name || 'Unknown') as string)
    .replace('{{company}}', (lead.company || 'Unknown') as string)
    .replace('{{job_title}}', (lead.job_title || 'Unknown') as string)
    .replace('{{location}}', `${lead.city || lead.location || 'Port Harcourt'}, ${lead.state || 'Rivers State'}, ${lead.country || 'Nigeria'}`)
    .replace('{{source}}', (lead.source || 'manual') as string)
    .replace('{{phone}}', (lead.phone || 'Unknown') as string)
    .replace('{{industry}}', (lead.industry || 'Unknown') as string)

  try {
    const response = await callClaude(prompt, { max_tokens: 800 })
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(cleaned) as QualificationResult

    const updateFields = {
      score: result.score,
      grade: result.grade,
      tier: result.tier,
      qualification_status: result.qualification_status,
      qualification_grade: result.grade,
      qualification_reasons: result.reasons,
      disqualifiers: result.disqualifiers,
      division_interest: result.division_best_fit === 'none' ? lead.division_interest : result.division_best_fit,
      budget_signal: result.budget_signal,
      urgency: result.urgency,
      decision_maker: result.decision_maker,
      talking_points: result.talking_points,
      recommended_approach: result.recommended_approach,
      best_channel: result.best_channel,
      product_interests: result.product_suggestions,
      qualified_at: new Date().toISOString(),
      qualification_notes: result.notes,
    }

    await db
      .from('leads')
      .update(updateFields as Record<string, unknown>)
      .eq('id', leadId)

    await db
      .from('crm_activities')
      .insert({
        id: crypto.randomUUID(),
        lead_id: leadId,
        type: 'score_updated',
        description: `AI qualification: Grade ${result.grade}, Score ${result.score}/100, Tier: ${result.tier}`,
        metadata: result,
        performed_by: 'ai_agent',
        created_at: new Date().toISOString(),
      })

    return result
  } catch {
    return null
  }
}

export async function qualifyAllPending(): Promise<{ qualified: number; disqualified: number; failed: number }> {
  const { data: pendingLeads } = await db
    .from('leads')
    .select('id')
    .eq('qualification_status', 'pending')
    .limit(100)

  if (!pendingLeads?.length) return { qualified: 0, disqualified: 0, failed: 0 }

  let qualified = 0
  let disqualified = 0
  let failed = 0

  for (const lead of pendingLeads) {
    const leadId = (lead as Record<string, unknown>).id as string
    const result = await qualifyLead(leadId)
    if (!result) {
      failed++
      continue
    }
    if (result.qualification_status === 'qualified') qualified++
    else disqualified++
  }

  return { qualified, disqualified, failed }
}
