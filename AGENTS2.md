# AGENTS2.md — Roshanal AI Platform Expansion v3.0
## Complete Platform Upgrade: CRM + Voice AI + Creative Studio + Video + Product System

---

## WHAT THIS EXPANSION ADDS

This is the final expansion that completes the platform. It adds:

1. **Full CRM Pipeline** — Visual kanban, lead scoring, deal stages, activity timeline
2. **Lead Scraper + AI Qualification** — Before any campaign fires, leads must be scraped, enriched, and AI-qualified
3. **ElevenLabs Voice Agent** — Inbound + outbound calling powered by ElevenLabs Conversational AI + Twilio
4. **URL Creative Scraper** — Paste any URL → AI scrapes creatives → transforms into UGC ads / product videos
5. **Standalone Video Creation Studio** — Full video tab separate from UGC (longer, cinematic, multi-scene)
6. **Product Management System** — Upload products manually, from URL, from web search, or bulk CSV
7. **AI Image & Banner Studio** — Standalone section: generate social banners, print-quality flyers, product mockups, OOH ads, ad creatives
8. **Campaign Engine v2** — Smart segmentation, automation triggers, email templates with product embeds, follow-ups, A/B testing
9. **Bonus features** — WhatsApp inbox, referrals, review collector, print center, weekly reports

---

## IMPLEMENTATION ORDER

### Phase 1 — CRM + Qualification (Week 1 of expansion)
- Full lead schema + Insforge collections
- CRM kanban + list view
- Lead profile page with activity timeline
- AI qualification engine (Claude)
- Qualification queue UI
- Lead scraping triggers (Apify)
- Preflight check enforcement on campaigns

### Phase 2 — Campaign Engine v2 (Week 2)
- Campaign builder with sequence steps
- All 8 email templates (fully designed)
- Automation trigger system
- A/B testing framework
- Campaign analytics dashboard

### Phase 3 — Voice Agent System (Week 3)
- ElevenLabs API client
- Create 4 pre-built voice agents via API
- Twilio phone number linking
- Outbound call launcher
- Inbound call webhook handler
- Call log + transcript viewer
- Voice agent UI

### Phase 4 — URL Scraper + Video Studio (Week 4)
- URL creative scraper
- Transformation pipeline (UGC/video from URL)
- Standalone video studio (multi-scene builder)
- Scene stitching with FFmpeg

### Phase 5 — Product System v2 + Banner Studio (Week 5)
- Multi-source product import (URL, image, CSV)
- Product catalog with analytics
- Banner studio (all 20+ format types)
- Quick generate packs

### Phase 6 — Bonus Features (Week 6)
- WhatsApp inbox manager
- Referral program
- Review collector
- Print center (catalog/profile PDFs)
- Weekly intelligence report
- Smart notification system

---

## DATABASE SCHEMA (New Collections)

See AGENTS.md for base schema. These are ADDITIONS:

```
crm_activities: { id, lead_id, type, description, metadata, performed_by, campaign_id, call_id, created_at }
campaign_sequences: { id, campaign_id, step_number, type, delay_days, delay_hours, send_at_time, template_id, condition, status, created_at }
campaign_events: { id, campaign_id, lead_id, step, event_type, channel, metadata, occurred_at }
automation_triggers: { id, name, trigger_expression, actions_json, is_active, fired_count, last_fired, created_at }
call_logs: { id, lead_id, agent_id, call_sid, conversation_id, type, from_number, to_number, duration_seconds, status, outcome, transcript_json, ai_summary, key_points, next_action, crm_actions, audio_url, started_at, ended_at }
voice_agents: { id, name, type, division, elevenlabs_agent_id, voice_id, system_prompt, first_message, is_active, total_calls, avg_duration, success_rate, created_at }
product_sources: { id, product_id, source_type, source_url, raw_extracted_data, processed_at }
generated_banners: { id, division, product_id, banner_type, style, prompt, model, image_url, size, format, cost_usd, is_saved, used_in_campaigns, created_at }
referrals: { id, referrer_lead_id, referred_lead_id, referral_code, status, reward_ngn, paid_at, created_at }
reviews: { id, lead_id, product_id, platform, rating, review_text, video_url, requested_at, submitted_at, published_to_social, social_post_id, created_at }
```

---

## NEW ROUTES

```
/dashboard/crm                    # CRM Pipeline home
/dashboard/crm/leads              # All leads table
/dashboard/crm/leads/:id          # Single lead profile
/dashboard/crm/qualification      # AI qualification queue

/dashboard/voice                  # Voice agent hub
/dashboard/voice/agents           # Create/manage voice agents
/dashboard/voice/calls            # Call history

/dashboard/products/add           # Multi-source product add

/dashboard/creative/banners       # AI Banner & Image Studio
/dashboard/creative/video         # Standalone Video Studio
/dashboard/creative/scraper       # URL Creative Scraper
/dashboard/creative/library       # Asset library

/dashboard/campaigns/create       # Campaign builder
/dashboard/campaigns/automation   # Trigger-based automation rules
/dashboard/campaigns/templates    # Email template library
```

---

## CRITICAL RULES

1. **Qualification before campaigns is ENFORCED** — Campaign "Launch" disabled if any lead has `qualification_status = 'pending'`
2. **ElevenLabs + Twilio for voice** — AI brain + telephony. Never call outside 9AM-8PM WAT
3. **Banner studio uses GPT Image 2 for text-heavy designs** — Auto-select when text present
4. **Video scenes generated separately then stitched** — Use FFmpeg WASM or Vercel Serverless
5. **All call transcripts stored encrypted** — Only admin + assigned operator can view
6. **Product images from URL import re-hosted to Vercel Blob** — Never serve from competitor CDN
7. **WhatsApp template approval required** — Pre-approved Meta templates only for broadcasts

---

## PROGRESS TRACKING

### Phase 1 — CRM + Qualification
- [ ] 1.1 Create new Insforge collections (crm_activities, campaign_sequences, call_logs, etc.)
- [ ] 1.2 Implement AI qualification engine (lib/ai/qualification-engine.ts)
- [ ] 1.3 CRM kanban view (components/crm/pipeline-kanban.tsx)
- [ ] 1.4 CRM pipeline page (app/dashboard/crm/page.tsx)
- [ ] 1.5 CRM leads list page (app/dashboard/crm/leads/page.tsx)
- [ ] 1.6 Single lead profile page (app/dashboard/crm/leads/[id]/page.tsx)
- [ ] 1.7 Qualification queue page (app/dashboard/crm/qualification/page.tsx)
- [ ] 1.8 CRM API routes (api/crm/*)
- [ ] 1.9 Update lead schema in lib/insforge/schema.ts

### Phase 2 — Campaign Engine v2
- [ ] 2.1 Campaign builder page (app/dashboard/campaigns/create/page.tsx)
- [ ] 2.2 Campaign sequence editor (components/campaigns/sequence-editor.tsx)
- [ ] 2.3 Preflight check system (components/campaigns/preflight-check.tsx)
- [ ] 2.4 Email templates library (app/dashboard/campaigns/templates/page.tsx)
- [ ] 2.5 Automation rules page (app/dashboard/campaigns/automation/page.tsx)
- [ ] 2.6 Campaign v2 API routes (api/campaigns/*)

### Phase 3 — Voice Agent System
- [ ] 3.1 ElevenLabs API client (lib/elevenlabs/client.ts)
- [ ] 3.2 Voice agent management (lib/voice/agent-manager.ts)
- [ ] 3.3 Voice agents page (app/dashboard/voice/agents/page.tsx)
- [ ] 3.4 Call history page (app/dashboard/voice/calls/page.tsx)
- [ ] 3.5 Voice API routes (api/voice/*)
- [ ] 3.6 ElevenLabs webhook handler (api/webhooks/elevenlabs/route.ts)

### Phase 4 — URL Scraper + Video Studio
- [ ] 4.1 URL creative scraper (lib/scraper/creative-scraper.ts)
- [ ] 4.2 URL scraper page (app/dashboard/creative/scraper/page.tsx)
- [ ] 4.3 Video studio page (app/dashboard/creative/video/page.tsx)
- [ ] 4.4 Video scene builder (components/video/scene-builder.tsx)
- [ ] 4.5 Video API routes (api/video/*, api/scraper/*)

### Phase 5 — Product System v2 + Banner Studio
- [ ] 5.1 Product add page (app/dashboard/products/add/page.tsx)
- [ ] 5.2 Banner studio page (app/dashboard/creative/banners/page.tsx)
- [ ] 5.3 Banner generation engine (lib/openrouter/banner-studio.ts)
- [ ] 5.4 Product import (api/products/import-*, api/banners/*)

### Phase 6 — Bonus Features
- [ ] 6.1 WhatsApp inbox (app/dashboard/whatsapp/page.tsx)
- [ ] 6.2 Referral program (components/referral/referral-manager.tsx)
- [ ] 6.3 Review collector (components/reviews/review-manager.tsx)
- [ ] 6.4 Print center (app/dashboard/print/page.tsx)
- [ ] 6.5 Weekly report generator (lib/reports/weekly-report.ts)

---

*Version: 3.0 Final*
*Extends: AGENTS.md*
