# AGENTS.md — Roshanal AI Build Guide
> Intelligent Business Growth Platform for Roshanal Infotech Limited, Port Harcourt, Nigeria
> Stack: Next.js 14+ (App Router) · InsForge.dev · Vercel · Tailwind CSS · Framer Motion

---

## PROJECT CONTEXT

### Company
**Roshanal Infotech Limited** — Port Harcourt, Nigeria

### Divisions
1. **Marine Equipment** — Outboard Engines (Suzuki, Yamaha), Fiberglass Boats, Marine Gadgets & Safety Tools, Bilge Pumps, Life Jackets, Boat Fenders, Ring Buoys, Fiberglass Chemicals
2. **Technology & Surveillance** — Hikvision CCTV & Surveillance, Smart Door Locks & Access Control, Car Trackers & GPS, Solar Installation & Lithium Batteries, Walkie-Talkies, Fire Alarm Systems, Biometric/Fingerprint Access, Maintenance

### Contact Information (hardcoded in all generated content)
- Address: No 18A Rumuola/Rumuadaolu Road, Adjacent Rumuadaolu Town Hall, Port Harcourt, Rivers State
- Branch Office: 41 Eastern Bypass, Opp NDDC Building, Port Harcourt
- Branch Office 2: 223 Chief Melfold Okilo Way, Amarat, Yenegoa, Bayelsa
- Phone: 08109522432 | 08033170802 | 08180388018
- Email: info@roshanalinfotech.com
- Website: roshanalinfotech.com

### Backend
- **InsForge.dev** — ONLY database (never Supabase, Firebase, MongoDB, Prisma)
- Project URL: https://8cftq4jt.us-east.insforge.app
- API Key: ik_20cf14317b8231a14ae5256b90c842c1
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MDY4OTh9.3YXytaaOvHQgdOFF1odGsbh07xpcMH2EEdKmcAsztok

### Repository
- GitHub: https://github.com/shuddi1962/Rosh-Workflow.git
- Push all commits to main

---

## CRITICAL RULES

1. **Insforge ONLY** — Never use Supabase, Firebase, Prisma, or any other database
2. **Vercel Compatibility** — API routes complete in under 60 seconds. Long jobs use BullMQ with Upstash Redis. Use Vercel Blob for file storage — never local filesystem in prod
3. **Single company, no multi-tenancy** — No subscription system, no plan tiers, no per-user billing
4. **Admin/User separation is absolute** — Admin routes (`/admin/*`, `/api/admin/*`) require `role === 'admin'` at middleware level
5. **All API keys through admin vault** — Team members never handle API keys. All keys stored encrypted in Insforge, fetched server-side only, never exposed to client
6. **Nigeria-first content** — All AI content defaults to Nigerian English, Nigerian context (Port Harcourt, Rivers State, Niger Delta, PHCN, ₦ currency, WhatsApp-first CTAs)
7. **Product images are priority** — When generating social posts, ALWAYS check the product catalog images first
8. **TypeScript strict mode** — `"strict": true` in tsconfig. No `any` types. All functions explicitly typed
9. **Rate limit everything** — Every API route has rate limiting via Upstash Redis. Claude API calls tracked against daily budget
10. **WhatsApp is primary channel** — Every CTA should default to WhatsApp. All contact info includes WhatsApp numbers

---

## TECH STACK

### Frontend
- Next.js 14+ (App Router) — deployed to Vercel
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Framer Motion (page transitions, scroll animations)
- TanStack Query v5 (server state)
- Zustand (client state)
- Recharts (analytics charts)
- React Hook Form + Zod (forms & validation)
- TanStack Table (data tables)
- Socket.io client (real-time updates)
- Lucide React (icons)

### Backend (API Routes in Next.js)
- Node.js via Next.js Route Handlers
- Insforge.dev — ONLY database
- BullMQ + Upstash Redis (job queues)
- Nodemailer (email notifications)
- Sharp (image processing)
- Playwright (competitive scraping)
- node-cron (scheduled tasks)
- Socket.io (WebSocket real-time)

---

## DESIGN SYSTEM

### Visual Identity
```css
:root {
  --bg-void: #04060F;
  --bg-base: #080C1A;
  --bg-surface: #0E1220;
  --bg-elevated: #151B2E;
  --bg-overlay: #1C2438;
  --border-ghost: rgba(255,255,255,0.03);
  --border-subtle: rgba(255,255,255,0.07);
  --border-default: rgba(255,255,255,0.11);
  --border-hover: rgba(255,255,255,0.18);
  --accent-primary: #1A56DB;
  --accent-primary-glow: #3B82F6;
  --accent-gold: #F59E0B;
  --accent-gold-light: #FCD34D;
  --accent-emerald: #10B981;
  --accent-red: #EF4444;
  --accent-orange: #F97316;
  --accent-purple: #8B5CF6;
  --text-primary: #F0F4FF;
  --text-secondary: #8B9CC8;
  --text-muted: #4A5475;
  --text-on-accent: #FFFFFF;
  --status-live: #10B981;
  --status-scheduled: #3B82F6;
  --status-draft: #F59E0B;
  --status-failed: #EF4444;
  --status-published: #10B981;
}
```

### Typography
```css
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

h1, h2, h3: 'Clash Display'
body, UI text: 'Cabinet Grotesk'
stats, metrics, code: 'JetBrains Mono'
```

### Component Patterns
- **KPI Cards**: Glowing left border in accent color, large JetBrains Mono number, percentage badge
- **Status Badges**: Pill style with color dot — Live (emerald), Scheduled (blue), Draft (gold), Failed (red)
- **Content Cards**: Dark surface with subtle border, hover lifts with border highlight
- **Action Buttons**: Primary = gradient blue-to-indigo, Secondary = ghost with border
- **AI Feature Indicators**: Purple glow, ✦ star prefix on AI-generated items
- **Competitor Intel Sections**: Orange left border to visually distinguish spy/competitor data

---

## FILE STRUCTURE

```
/app
  /(public)
    /page.tsx                    # Marketing homepage
  /(auth)
    /login/page.tsx
    /register/page.tsx           # Invite-only (admin creates accounts)
  /(dashboard)                   # Regular user — content operator
    /dashboard/page.tsx          # Overview
    /dashboard/content/page.tsx  # Content Brain Box (flagship)
    /dashboard/trends/page.tsx   # Live trend monitor
    /dashboard/competitors/page.tsx  # Competitor spy module
    /dashboard/social/page.tsx   # Social media scheduler
    /dashboard/campaigns/page.tsx # Outreach campaigns
    /dashboard/ugc/page.tsx      # UGC Ad creator
    /dashboard/products/page.tsx # Product catalog
    /dashboard/analytics/page.tsx
    /dashboard/settings/page.tsx
  /(admin)                       # Full admin — owner/founder access
    /admin/page.tsx              # Admin overview
    /admin/api-keys/page.tsx     # All API key management
    /admin/users/page.tsx        # Manage team members
    /admin/leads/page.tsx        # Lead management
    /admin/campaigns/page.tsx    # Campaign oversight
    /admin/social-accounts/page.tsx
    /admin/products/page.tsx     # Product catalog management
    /admin/analytics/page.tsx    # Full platform analytics
    /admin/audit-logs/page.tsx
    /admin/settings/page.tsx     # Business settings

/components
  /ui/                           # shadcn/ui base
  /dashboard/                    # Dashboard components
  /admin/                        # Admin-only components
  /content/                      # Content brain components
  /social/                       # Social media components
  /competitor/                   # Competitor intel components
  /ugc/                          # UGC ad creator components

/lib
  /insforge/                     # Insforge client + schema
  /ai/                           # Claude API wrappers
  /apify/                        # Scraping actors
  /social/                       # Platform publishers
  /email/                        # SendGrid integration
  /twilio/                       # SMS + Voice
  /trends/                       # Trend aggregation
  /competitor/                   # Competitor analysis
  /ugc/                          # UGC generation logic

/api
  /api/auth/                     # Auth routes
  /api/content/                  # Content generation
  /api/trends/                   # Trend fetching
  /api/competitor/               # Competitor scraping
  /api/social/                   # Social publishing
  /api/campaigns/                # Campaign sending
  /api/ugc/                      # UGC generation
  /api/products/                 # Product CRUD
  /api/leads/                    # Lead management
  /api/admin/                    # Admin-only routes
  /api/webhooks/                 # Incoming webhooks
```

---

## IMPLEMENTATION PHASES

### Phase 1 — Foundation (Week 1)
- [ ] Next.js 14 project setup + Vercel deployment
- [ ] Insforge connection + all schema creation
- [ ] Environment config with startup validation
- [ ] Auth system (login/logout/JWT/RBAC)
- [ ] Admin and User layout shells
- [ ] API Key vault (admin)

### Phase 2 — Content Brain (Week 2)
- [ ] Business profile + product catalog (Admin)
- [ ] Live trend fetching (Google Trends + News API)
- [ ] Content Brain Box UI + Claude content generation
- [ ] Social post creation + saving to Insforge
- [ ] Platform-specific formatting

### Phase 3 — Competitor Intel (Week 3)
- [ ] Apify integration for competitor scraping
- [ ] Facebook Meta Ad Library scraping
- [ ] Competitor analysis with Claude
- [ ] "What We're Not Doing" report
- [ ] "Steal This Ad" feature

### Phase 4 — Social Automation (Week 4)
- [ ] OAuth connections (Meta, Twitter, LinkedIn)
- [ ] WhatsApp Business API integration
- [ ] Post scheduler + calendar view
- [ ] Auto-publish queue with rate limit protection
- [ ] Engagement tracking

### Phase 5 — UGC Ad Creator (Week 5)
- [ ] All UGC ad type generation (Claude API)
- [ ] Video script generator
- [ ] Ad preview cards
- [ ] Export and scheduling integration

### Phase 6 — Campaigns + Leads (Week 6)
- [ ] Apify lead scraping (Google Maps + LinkedIn)
- [ ] Lead management CRM view
- [ ] Email campaigns (SendGrid)
- [ ] WhatsApp broadcasts (Meta API)
- [ ] SMS campaigns (Twilio)

### Phase 7 — Analytics + Polish (Week 7)
- [ ] Analytics dashboard
- [ ] Real-time WebSocket events
- [ ] Audit logs
- [ ] Mobile responsiveness
- [ ] Performance optimization for Vercel

---

## MODULE DETAILS

### MODULE 1: CONTENT BRAIN BOX (`/dashboard/content`)

#### 1.1 Business Knowledge Base (Pre-loaded, Admin-editable)

```typescript
const ROSHANAL_BUSINESS_PROFILE = {
  name: "Roshanal Infotech Limited",
  tagline: "Your Trusted Partner for Marine & Technology Solutions",
  divisions: [
    {
      name: "Marine Division",
      products: [
        "Outboard Engines (Suzuki, Yamaha — 15HP to 300HP)",
        "Fiberglass Boats (patrol, speedboat, passenger)",
        "Marine Safety Tools (life jackets, ring buoys, fire extinguishers)",
        "Boat Accessories (fenders, antennas, navigation lights)",
        "Fiberglass Chemicals & Repair Materials",
        "Bilge Pumps & Marine Electronics",
        "Marine Gadgets & Instruments"
      ],
      target_customers: [
        "Oil & Gas companies with marine operations in Niger Delta",
        "Nigerian Navy and security agencies",
        "Commercial boat operators on waterways",
        "Fishing boat owners in Rivers State and Bayelsa",
        "Marina operators and boat clubs",
        "NDDC contractors with waterway projects"
      ],
      pain_points: [
        "Difficulty sourcing genuine outboard engine parts in Port Harcourt",
        "No reliable supplier for fiberglass boat repair materials",
        "Safety compliance requirements for oil & gas marine operations",
        "High cost of importing marine equipment from Lagos"
      ],
      usps: [
        "Genuine Suzuki and Yamaha authorized service and parts",
        "Locally available in Port Harcourt — no Lagos trips needed",
        "Expert fiberglass boat repair and customization",
        "Oil & gas marine compliance certified products",
        "Immediate delivery from Port Harcourt warehouse"
      ]
    },
    {
      name: "Technology & Surveillance Division",
      products: [
        "Hikvision CCTV Cameras (dome, bullet, PTZ, IP cameras)",
        "Complete Surveillance Systems (NVR/DVR + cameras)",
        "Smart Door Locks & Biometric Access Control",
        "Car Trackers & GPS Vehicle Management",
        "Solar Power Systems & Lithium Batteries (LivFast brand)",
        "Walkie-Talkies & Two-Way Radios",
        "Fire Alarm Systems & Safety Equipment",
        "Intercom Systems",
        "Maintenance & Technical Support"
      ],
      target_customers: [
        "Homes and estates in GRA, Rumuola, Eliozu, Trans Amadi Port Harcourt",
        "Banks and financial institutions in Port Harcourt",
        "Schools, churches, hospitals requiring security",
        "Businesses and offices needing access control",
        "Vehicle fleet operators needing GPS tracking",
        "Residential buildings needing solar power (PHCN epileptic supply)",
        "Hotels, guesthouses, hospitality businesses"
      ],
      pain_points: [
        "Insecurity and armed robbery incidents driving demand for CCTV",
        "Epileptic power supply (PHCN/NEPA) driving solar demand",
        "Vehicle theft in Port Harcourt driving car tracker demand",
        "Businesses losing money to employee fraud (access control need)",
        "Rising cost of diesel for generators (solar alternative needed)"
      ],
      usps: [
        "Hikvision authorized dealer — genuine products with warranty",
        "Professional installation by certified technicians",
        "24/7 technical support and maintenance contracts",
        "Best prices in Port Harcourt — no middleman markup",
        "Same-day installation available in Port Harcourt metropolis"
      ]
    }
  ],
  brand_voice: "Professional yet approachable, expert authority, local Nigerian context, urgent CTAs, WhatsApp-first communication style",
  posting_style: "Direct, benefit-focused, strong CTAs to DM/call/WhatsApp, use of emojis for social, formal for LinkedIn"
}
```

#### 1.2 Content Types — "Content Idea Bank"

**For Marine Division:**
- A) PRODUCT SPOTLIGHT — Feature one product with specs, price range, availability
- B) NEW ARRIVAL — "Just Arrived: [Product] — DM for details"
- C) EDUCATIONAL — "5 Signs Your Outboard Engine Needs Servicing"
- D) TREND REACTIVE — React to Nigeria maritime news, oil spill events, boat incidents
- E) TESTIMONIAL — Customer using product on their boat/vessel
- F) COMPARISON — "Suzuki vs Yamaha: Which Engine is Right for Your Boat?"
- G) SEASONAL — Pre-rainy season boat maintenance, dry season fishing season
- H) HOW-TO — "How to Choose the Right Life Jacket for Niger Delta Operations"
- I) BEHIND THE SCENES — Warehouse footage, product unboxing, installation process
- J) PROBLEM-SOLUTION — "Tired of Engine Breakdowns Mid-Sea? Here's the Solution"
- K) PRICE POST — Transparent pricing builds trust: "Suzuki 100HP from ₦X,XXX,XXX"
- L) FAQ — Answer "Do you have spare parts for Yamaha?" type questions
- M) LOCAL CONTEXT — "For Every Boat Operator on the Bonny River..."
- N) BEFORE/AFTER — Boat before fiberglass repair vs after
- O) URGENCY — "Last 3 Units of [Product] — Order Before They Run Out"

**For Tech/Surveillance Division:**
- A) SECURITY AWARENESS — "Armed robbery in PH: How CCTV Deters Criminals"
- B) POWER CRISIS CONTENT — "PHCN Off for 3 Days? Our Solar Systems Keep You Running"
- C) PRODUCT DEMO — Show Hikvision camera footage quality
- D) INSTALLATION HIGHLIGHT — Show completed CCTV/solar installations
- E) SAVINGS CALCULATOR — "How Much Are You Spending on Diesel vs Solar?"
- F) COMPARISON — "Analog vs IP CCTV: What You're Missing in 2025"
- G) CASE STUDY — "How We Secured This Estate in GRA, Port Harcourt"
- H) TRENDING NEWS REACTIVE — "After Recent Robberies in [Area], Protect Your Home"
- I) CORPORATE PITCH — "Banks, Hotels & Offices: Enterprise Security Solutions"
- J) CAR TRACKER EDUCATION — "Your Vehicle Was Stolen? This Prevents It"
- K) SMART HOME — "Control Your Door Lock with Your Phone"
- L) SEASONAL OFFER — Rainy season solar deals, New Year security upgrades
- M) TECHNICAL TIPS — "How to Check If Your CCTV Is Recording Properly"
- N) PACKAGE DEALS — "Complete Home Security Package: CCTV + Solar + Smart Lock"
- O) MAINTENANCE REMINDER — "When Did You Last Service Your Surveillance System?"

#### 1.3 AI Content Generation Engine — Claude System Prompt Template

```
You are the dedicated content AI for Roshanal Infotech Limited, a marine equipment and technology company based in Port Harcourt, Nigeria.

Company Profile:
[FULL BUSINESS PROFILE INJECTED]

Product Catalog:
[PRODUCT CATALOG INJECTED]

Current Trending Topics:
[LIVE TRENDS INJECTED]

Your role: Generate highly targeted, conversion-focused content that:
1. Speaks directly to businesses and individuals in Port Harcourt, Rivers State, and the Niger Delta
2. References real local pain points (insecurity, PHCN failures, waterway operations)
3. Always includes contact info: 08109522432 | 08033170802 | 08180388018
4. Uses authentic Nigerian English and relevant cultural references
5. Drives action (DM, WhatsApp, Call, Visit showroom)
6. Leverages trending topics in marine and security sectors
```

---

### MODULE 2: LIVE TREND MONITOR (`/dashboard/trends`)

#### 2.1 Trend Sources

**Marine & Waterway Trends:**
```typescript
const MARINE_TREND_KEYWORDS = [
  "outboard engine Nigeria",
  "fiberglass boat Port Harcourt",
  "marine equipment Rivers State",
  "Suzuki Yamaha engine price Nigeria",
  "boat accident Niger Delta",
  "maritime security Nigeria",
  "NIMASA regulations 2025",
  "boat operator license Nigeria",
  "marine safety equipment Nigeria",
  "Niger Delta waterway",
  "Bonny River boat",
  "NDDC waterway project"
]
```

**Security & Technology Trends:**
```typescript
const TECH_TREND_KEYWORDS = [
  "CCTV installation Port Harcourt",
  "Hikvision camera price Nigeria",
  "solar inverter price Nigeria",
  "PHCN outage Port Harcourt",
  "armed robbery Port Harcourt",
  "home security Nigeria 2025",
  "car tracker Nigeria price",
  "smart door lock Nigeria",
  "solar battery lithium Nigeria",
  "generator alternative Nigeria",
  "biometric access control Nigeria",
  "fire alarm system Port Harcourt"
]
```

#### 2.2 Trend Data Sources Integration

```typescript
1. Google Trends API (real-time trending topics)
   - Geo filter: Nigeria (NG)
   - Categories: Technology, Business
   - Frequency: Every 30 minutes

2. News API (newsapi.org)
   - Queries: Marine + security keywords above
   - Sources: Vanguard, Punch, Guardian Nigeria, Channels TV
   - Frequency: Every 15 minutes

3. Reddit Scraper (Apify)
   - Subreddits: r/Nigeria, r/PortHarcourt, r/AfricanTech, r/solarenergy
   - Sort: Hot, Rising
   - Frequency: Every 30 minutes

4. Twitter/X Trends
   - Location: Nigeria
   - Hashtag monitoring
   - Frequency: Every 20 minutes

5. YouTube Trending
   - Category: Science & Technology
   - Region: NG
   - Frequency: Every 2 hours

6. Meta Ad Library (competitor ads)
   - Scrape active ads from security/marine competitors in Nigeria
   - Frequency: Daily
```

#### 2.3 Trend Scoring Algorithm

```typescript
interface TrendScore {
  raw_momentum: number;     // How fast is it growing (0-100)
  relevance_marine: number; // How relevant to marine division (0-100)
  relevance_tech: number;   // How relevant to tech division (0-100)
  local_relevance: number;  // How relevant to Port Harcourt/Nigeria (0-100)
  commercial_intent: number;// Does it indicate buying intent (0-100)
  composite_score: number;  // Weighted average
  recommended_action: string;
  content_opportunity: string;
}
```

---

### MODULE 3: COMPETITOR SPY INTELLIGENCE (`/dashboard/competitors`)

#### 3.1 Competitor Monitoring Setup

**Marine Competitors:**
- Search Google Maps for "outboard engine Port Harcourt", "marine equipment Rivers State"
- Monitor their Facebook pages, Instagram accounts
- Track their Google My Business listings, review scores

**Security/Tech Competitors:**
- Search Google Maps for "CCTV installation Port Harcourt", "solar installation Rivers State"
- Monitor Hikvision dealers in Nigeria
- Track Facebook ads from security companies in PH

#### 3.2 What the Competitor Spy Steals

```typescript
interface CompetitorIntelReport {
  // CONTENT STRATEGY THEFT
  top_performing_posts: {
    platform: string;
    content: string;
    engagement: number;
    post_type: string;
    what_worked: string; // AI analysis of WHY it performed
  }[];
  
  posting_frequency: {
    platform: string;
    posts_per_week: number;
    best_days: string[];
    best_times: string[];
  }[];
  
  hashtag_strategy: {
    most_used: string[];
    highest_engagement: string[];
    hashtags_they_own: string[]; // They dominate these
    hashtag_gaps: string[]; // They don't use these but should
  };
  
  content_formats: {
    image_percentage: number;
    video_percentage: number;
    reel_percentage: number;
    text_percentage: number;
    carousel_percentage: number;
    top_format: string;
  };
  
  // AD INTELLIGENCE
  active_ads: {
    ad_type: string;
    creative_description: string;
    copy_angle: string; // fear, aspiration, savings, urgency
    cta: string;
    estimated_run_days: number;
    what_we_can_steal: string;
  }[];
  
  // GAPS ROSHANAL CAN EXPLOIT
  content_gaps: string[]; // Topics they ignore that we should own
  audience_gaps: string[]; // Customer segments they miss
  offer_gaps: string[]; // Products/services they don't offer
  location_gaps: string[]; // Areas they don't serve
  
  // WHAT ROSHANAL IS NOT DOING RIGHT
  roshanal_weaknesses: {
    weakness: string;
    competitor_doing_it: string;
    recommended_fix: string;
    priority: 'critical' | 'high' | 'medium';
  }[];
  
  // AI RECOMMENDATIONS
  immediate_actions: string[]; // Do this week
  content_ideas_from_competitor: string[]; // Inspired by their wins
  counter_campaign_ideas: string[]; // Attack their strategy
}
```

---

### MODULE 4: UGC AD CREATOR (`/dashboard/ugc`)

#### 4.1 UGC Ad Types

```typescript
enum UGCAdType {
  TESTIMONIAL_SCRIPT = "Customer testimonial video script",
  UNBOXING_SCRIPT = "Product unboxing video script",
  INSTALLATION_WALKTHROUGH = "Installation process walkthrough script",
  PROBLEM_SOLUTION = "Problem → Agitation → Solution video script",
  DAY_IN_LIFE = "Day in the life of someone using our product",
  VLOG_STYLE = "Behind-the-scenes vlog style script",
  FACEBOOK_LEAD_AD = "Facebook/Instagram lead generation ad",
  CAROUSEL_AD = "Multi-slide carousel ad (swipe through)",
  STORY_AD = "15-second story ad with text overlays",
  PRODUCT_SHOWCASE = "Clean product showcase with specs",
  BEFORE_AFTER = "Before/after transformation ad",
  OFFER_AD = "Limited time offer/discount ad",
  WHATSAPP_BROADCAST = "WhatsApp broadcast message",
  WHATSAPP_STATUS = "WhatsApp status text/image",
  WHATSAPP_CATALOG = "WhatsApp product catalog message",
  GOOGLE_SEARCH_AD = "Google Search ad (headline + descriptions)",
  GOOGLE_DISPLAY_AD = "Google Display ad copy",
  EMAIL_BLAST = "Promotional email blast",
  FOLLOW_UP_EMAIL = "Follow-up email sequence",
  SMS_BLAST = "Bulk SMS marketing message",
}
```

---

### MODULE 5: SOCIAL MEDIA AUTOMATION (`/dashboard/social`)

#### 5.1 Platform Connections

- **Facebook Pages** — Meta Graph API v18+
- **Instagram Business** — Meta Graph API (via Facebook)
- **WhatsApp Business** — Meta WhatsApp Cloud API
- **LinkedIn Company Page** — LinkedIn API v2
- **Twitter/X** — X API v2 (Basic tier)
- **TikTok** — TikTok for Business API
- **YouTube** — YouTube Data API v3
- **Telegram Channel** — Telegram Bot API
- **Google Business Profile** — GMB API

#### 5.2 Optimal Posting Times (Nigeria-specific)

```typescript
const NIGERIA_OPTIMAL_TIMES = {
  instagram: {
    weekdays: ["07:00", "12:00", "20:00"],
    weekends: ["09:00", "19:00"]
  },
  facebook: {
    weekdays: ["08:00", "13:00", "19:00"],
    weekends: ["10:00", "18:00"]
  },
  whatsapp_status: {
    all: ["07:00", "19:00"]
  },
  linkedin: {
    weekdays: ["08:00", "12:00"],
    weekends: []
  },
  twitter: {
    all: ["09:00", "14:00", "21:00"]
  }
}
```

---

### MODULE 6: OUTREACH & CAMPAIGNS (`/dashboard/campaigns`)

#### 6.1 Campaign Types

- **WhatsApp Bulk Campaign** — Upload contact list CSV, AI generates WhatsApp-optimized message, schedule and send via Meta WhatsApp Cloud API, track delivery and read receipts, auto-follow-up if no response in 48 hours, manages opt-outs (STOP keyword)
- **Email Campaign** — SendGrid integration, AI-generated email templates per division, product image embedding, personalization: {{first_name}}, {{company}}, {{product_interest}}, drip sequences: Day 1 intro → Day 3 follow-up → Day 7 offer → Day 14 last chance
- **SMS Campaign** — Twilio SMS API, short punchy AI-generated SMS, track delivery, include short link to WhatsApp or product page
- **Cold Email for B2B Marine Clients** — Target: Oil & gas companies, NNPC contractors, marine operators, AI generates personalized cold emails referencing their specific industry, track opens and clicks

#### 6.2 Lead Management

```typescript
interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  location: string;
  division_interest: 'marine' | 'tech' | 'both';
  product_interest: string[];
  source: 'scraping' | 'whatsapp_inquiry' | 'referral' | 'walk_in' | 'social_dm' | 'google';
  status: 'new' | 'contacted' | 'interested' | 'quote_sent' | 'customer' | 'lost';
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  notes: string;
  last_contact: Date;
  next_action: string;
  next_action_date: Date;
  created_at: Date;
}
```

#### 6.3 Lead Scraping Sources

```typescript
const LEAD_SOURCES = {
  google_maps: {
    actor: "compass/google-maps-scraper",
    queries: [
      "oil companies Port Harcourt",
      "boat operators Rivers State",
      "security companies Port Harcourt",
      "hotels Port Harcourt",
      "banks Port Harcourt",
      "estates Port Harcourt",
      "oil servicing companies Niger Delta"
    ]
  },
  google_search: {
    actor: "apify/google-search-scraper",
    queries: [
      "CCTV installation Port Harcourt",
      "outboard engine dealers Nigeria",
      "marine equipment companies Niger Delta"
    ]
  },
  instagram: {
    actor: "apify/instagram-scraper",
    hashtags: [
      "#portharcourtbusiness",
      "#riverstatenews",
      "#oilandgas",
      "#portharcourtlife",
      "#phcbusiness"
    ]
  },
  linkedin: {
    actor: "apify/linkedin-scraper",
    searches: [
      "Procurement Manager Port Harcourt",
      "Facility Manager Rivers State",
      "Marine Superintendent Nigeria",
      "HSE Manager Niger Delta"
    ]
  }
}
```

---

### MODULE 7: PRODUCT CATALOG (`/dashboard/products`)

#### 7.1 Product Schema

```typescript
interface Product {
  id: string;
  division: 'marine' | 'tech';
  category: string;
  brand: string;
  name: string;
  model?: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  price_naira?: number;
  price_display: string;
  images: ProductImage[];
  keywords: string[];
  is_new_arrival: boolean;
  is_featured: boolean;
  is_available: boolean;
  availability_note?: string;
  warranty?: string;
  installation_required: boolean;
  installation_area: string[];
  created_at: Date;
  updated_at: Date;
}
```

---

### MODULE 8: ANALYTICS DASHBOARD (`/dashboard/analytics`)

#### 8.1 Key Metrics

- Total reach this month
- Social posts this week
- Leads generated this month
- Campaigns sent this month
- Content pieces created
- Platform breakdown (Instagram, Facebook, WhatsApp, LinkedIn)
- Content performance (best post type, best division, best day, best hashtag)

---

### MODULE 9: ADMIN PANEL (`/admin`) — FULL ACCESS

#### 9.1 Admin Sidebar Navigation

```
[🔴 ADMIN PANEL — ROSHANAL INFOTECH]
═══════════════════════════════════
🏠  Admin Overview
🔑  API Key Management       ← All third-party API keys
👥  User Management          ← Create/manage team accounts
─────────────────────────────
📦  Product Catalog          ← Full product CRUD + images
👔  Lead Management          ← All leads from all sources
📧  Campaign Management      ← All campaigns
📱  Social Accounts          ← Connect/manage all platforms
─────────────────────────────
🕵️  Competitor Monitor       ← Set up competitor tracking
📊  Analytics                ← Full business intelligence
📋  Audit Logs               ← Every action logged
─────────────────────────────
🌐  Business Settings        ← Company profile, contact info
🎛️  Platform Settings        ← Feature toggles, automation rules
📮  Notifications            ← Email/SMS alert settings
═══════════════════════════════════
[👤 Your Profile]  [🚪 Sign Out]
```

#### 9.2 Feature Toggles

```typescript
interface FeatureToggles {
  auto_trend_discovery: boolean;
  auto_competitor_monitoring: boolean;
  auto_post_enabled: boolean;
  ai_content_generation: boolean;
  image_generation: boolean;
  ugc_ad_generation: boolean;
  lead_scraping: boolean;
  email_campaigns: boolean;
  sms_campaigns: boolean;
  whatsapp_campaigns: boolean;
  instagram_auto_post: boolean;
  facebook_auto_post: boolean;
  whatsapp_status_auto: boolean;
  linkedin_auto_post: boolean;
  twitter_auto_post: boolean;
  tiktok_auto_post: boolean;
  daily_ai_budget_usd: number;
  daily_image_budget_usd: number;
  monthly_scraping_budget_usd: number;
}
```

---

### MODULE 10: DATABASE SCHEMA (Insforge.dev)

```javascript
const COLLECTIONS = {
  users: {
    id: "string (uuid)",
    email: "string (unique)",
    password_hash: "string",
    full_name: "string",
    role: "string",           // 'admin' | 'operator'
    avatar_url: "string",
    is_active: "boolean",
    last_login: "timestamp",
    created_at: "timestamp"
  },
  business_profile: {
    id: "string",
    name: "string",
    tagline: "string",
    description: "string",
    divisions: "json[]",
    contact_info: "json",
    brand_voice: "string",
    logo_url: "string",
    brand_colors: "string[]",
    updated_at: "timestamp"
  },
  products: {
    id: "string",
    division: "string",
    category: "string",
    brand: "string",
    name: "string",
    model: "string",
    description: "string",
    features: "string[]",
    specifications: "json",
    price_naira: "number",
    price_display: "string",
    images: "json[]",
    keywords: "string[]",
    is_new_arrival: "boolean",
    is_featured: "boolean",
    is_available: "boolean",
    created_at: "timestamp",
    updated_at: "timestamp"
  },
  trends: {
    id: "string",
    keyword: "string",
    topic: "string",
    description: "string",
    source: "string",
    source_url: "string",
    momentum_score: "number",
    division_relevance: "string",
    matched_products: "string[]",
    is_breaking: "boolean",
    discovered_at: "timestamp",
    expires_at: "timestamp",
    status: "string"
  },
  competitors: {
    id: "string",
    name: "string",
    website: "string",
    facebook_url: "string",
    instagram_url: "string",
    division: "string",
    last_scanned: "timestamp",
    intel_report: "json",
    active_ads: "json[]",
    posting_patterns: "json",
    created_at: "timestamp"
  },
  social_posts: {
    id: "string",
    division: "string",
    product_id: "string",
    trend_id: "string",
    post_type: "string",
    platform: "string",
    caption: "text",
    hashtags: "string[]",
    image_url: "string",
    image_source: "string",
    cta: "string",
    status: "string",
    scheduled_at: "timestamp",
    published_at: "timestamp",
    platform_post_id: "string",
    engagement: "json",
    auto_generated: "boolean",
    created_at: "timestamp"
  },
  ugc_ads: {
    id: "string",
    division: "string",
    product_id: "string",
    ad_type: "string",
    platform: "string",
    headline: "string",
    primary_text: "text",
    description: "string",
    cta_button: "string",
    video_script: "text",
    image_url: "string",
    status: "string",
    used_in_campaign: "boolean",
    campaign_id: "string",
    created_at: "timestamp"
  },
  leads: {
    id: "string",
    name: "string",
    phone: "string",
    email: "string",
    company: "string",
    location: "string",
    division_interest: "string",
    product_interest: "string[]",
    source: "string",
    status: "string",
    score: "number",
    tier: "string",
    notes: "string",
    last_contact: "timestamp",
    next_action: "string",
    next_action_date: "timestamp",
    created_at: "timestamp"
  },
  campaigns: {
    id: "string",
    name: "string",
    type: "string",
    division: "string",
    target_leads: "string[]",
    message_template: "text",
    subject: "string",
    media_url: "string",
    status: "string",
    scheduled_at: "timestamp",
    sent_at: "timestamp",
    stats: "json",
    created_at: "timestamp"
  },
  social_accounts: {
    id: "string",
    platform: "string",
    account_name: "string",
    account_id: "string",
    access_token: "string",
    token_expiry: "timestamp",
    is_connected: "boolean",
    last_post: "timestamp",
    post_count_today: "number",
    created_at: "timestamp"
  },
  api_keys: {
    id: "string",
    service: "string",
    key_name: "string",
    encrypted_value: "string",
    is_active: "boolean",
    last_tested: "timestamp",
    last_test_result: "string",
    usage_today: "number",
    updated_at: "timestamp"
  },
  audit_logs: {
    id: "string",
    user_id: "string",
    action: "string",
    entity_type: "string",
    entity_id: "string",
    details: "json",
    ip_address: "string",
    user_agent: "string",
    created_at: "timestamp"
  },
  feature_toggles: {
    id: "string",
    feature_key: "string",
    is_enabled: "boolean",
    value: "json",
    updated_by: "string",
    updated_at: "timestamp"
  },
  analytics_daily: {
    id: "string",
    date: "date",
    posts_published: "number",
    total_reach: "number",
    total_engagement: "number",
    leads_generated: "number",
    campaigns_sent: "number",
    ai_cost_usd: "number",
    platform_breakdown: "json",
    top_posts: "json[]"
  }
}
```

---

### MODULE 11: AUTOMATION SCHEDULER

```typescript
const CRON_JOBS = {
  'process_scheduled_posts':    '*/1 * * * *',
  'process_campaign_queue':     '*/2 * * * *',
  'fetch_google_trends':        '*/15 * * * *',
  'fetch_news_api':             '*/15 * * * *',
  'fetch_social_trends':        '*/30 * * * *',
  'track_post_engagement':      '*/20 * * * *',
  'analyze_competitor_content': '0 * * * *',
  'generate_content_ideas':     '0 */2 * * *',
  'refresh_lead_scores':        '0 */3 * * *',
  'full_competitor_scrape':     '0 6 * * *',
  'generate_weekly_calendar':   '0 7 * * MON',
  'send_analytics_report':      '0 8 * * *',
  'scrape_competitor_ads':      '0 9 * * *',
  'cleanup_expired_trends':     '0 3 * * *',
  'verify_social_tokens':       '0 10 * * *',
  'full_lead_scrape':           '0 8 * * MON',
  'generate_content_calendar':  '0 9 * * SUN',
  'competitor_intel_report':    '0 10 * * MON',
}
```

---

### MODULE 12: AI SYSTEM PROMPTS LIBRARY

#### 12.1 Master Content Agent

```
You are the AI marketing brain for Roshanal Infotech Limited, Port Harcourt, Nigeria.

COMPANY: Roshanal Infotech Limited
LOCATION: Port Harcourt, Rivers State, Nigeria
BRANCH: Yenegoa, Bayelsa State

DIVISIONS:
1. Marine: Outboard engines (Suzuki, Yamaha), fiberglass boats, marine gadgets, safety tools
2. Technology: Hikvision CCTV, solar systems, smart locks, car trackers, walkie-talkies, fire alarms

CONTACTS (ALWAYS INCLUDE IN POSTS):
- Phone: 08109522432 | 08033170802 | 08180388018
- Email: info@roshanalinfotech.com
- Address: No 18A Rumuola/Rumuadaolu Road, Port Harcourt

TARGET MARKETS:
- Marine: Oil & gas operators, commercial boat owners, fishermen, NDDC contractors
- Technology: Homeowners, businesses, banks, hotels, estates, fleet operators in Rivers/Bayelsa

BRAND VOICE: Expert, trusted, urgent, locally relevant, WhatsApp-friendly

ALWAYS:
- Include contact info in every post
- Reference local context (Port Harcourt, Niger Delta, PHCN, security incidents)
- Drive to WhatsApp or phone call — Nigeria is WhatsApp-first
- Use ₦ for prices, not $
- Write in natural Nigerian English where appropriate
- Include relevant emojis for social posts
- Create genuine urgency (stock, limited time, seasonal)
```

#### 12.2 Competitor Analysis Agent

```
You are a competitive intelligence analyst for Roshanal Infotech Limited.

You have been given scraped data from competitor social media accounts, websites, and Facebook ads.

Your job:
1. Identify what competitors are doing well that Roshanal is NOT doing
2. Find content gaps — topics they cover that Roshanal ignores
3. Analyze their ad angles — fear-based? savings-based? aspiration-based?
4. Identify the weaknesses in their strategy that Roshanal can exploit
5. Generate 10 specific, actionable content ideas Roshanal should create NOW
6. Rate each gap by urgency: critical (hurting sales now) / high / medium

Output a structured JSON report with specific examples, not generic advice.
Every recommendation must reference actual data from the competitor scrape.
```

#### 12.3 Trend-to-Content Bridge Agent

```
You receive live trending data relevant to Roshanal's business.

For each trend, you determine:
1. Which Roshanal product/service is most relevant
2. What content angle to use (educational, promotional, problem-solution, news reactive)
3. Which platform would perform best for this type of content
4. Draft the actual post (caption, hashtags, CTA)
5. Rate the commercial opportunity (will this drive actual inquiries?)

Priority: Posts that combine a trending topic WITH a specific product WITH a clear CTA 
to WhatsApp/call score highest. Generic trend posts with no commercial angle score lowest.

Local context first: Always ask — does this trend have a Port Harcourt / Niger Delta angle?
```

---

### MODULE 13: FULL API ROUTES

```
# AUTH
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me

# PRODUCTS
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/products/:id/images

# TRENDS
GET  /api/trends/live
GET  /api/trends/history
POST /api/trends/refresh
POST /api/trends/match-product

# CONTENT BRAIN
POST /api/content/generate
POST /api/content/batch
GET  /api/content/ideas
POST /api/content/ideas/:id/approve
POST /api/content/calendar

# COMPETITOR INTEL
GET  /api/competitors
POST /api/competitors
GET  /api/competitors/:id/scrape
POST /api/competitors/scrape-all
GET  /api/competitors/gap-analysis

# SOCIAL MEDIA
GET    /api/social/posts
POST   /api/social/posts
PUT    /api/social/posts/:id
DELETE /api/social/posts/:id
POST   /api/social/posts/:id/publish
POST   /api/social/posts/:id/schedule
GET    /api/social/accounts
POST   /api/social/accounts/connect/:platform
GET    /api/social/analytics
GET    /api/social/queue
POST   /api/social/bulk-schedule

# UGC ADS
POST /api/ugc/generate
GET  /api/ugc/ads
PUT  /api/ugc/ads/:id
DELETE /api/ugc/ads/:id
POST /api/ugc/ads/:id/use-in-campaign

# CAMPAIGNS
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
POST   /api/campaigns/:id/send
POST   /api/campaigns/:id/schedule
GET    /api/campaigns/:id/analytics

# LEADS
GET    /api/leads
POST   /api/leads
PUT    /api/leads/:id
DELETE /api/leads/:id
POST   /api/leads/scrape
POST   /api/leads/import
POST   /api/leads/qualify-all
PUT    /api/leads/:id/status
GET    /api/leads/stats

# ANALYTICS
GET /api/analytics/overview
GET /api/analytics/social
GET /api/analytics/campaigns
GET /api/analytics/leads
GET /api/analytics/trends
GET /api/analytics/competitors

# ADMIN ONLY
GET    /api/admin/api-keys
POST   /api/admin/api-keys
PUT    /api/admin/api-keys/:id
DELETE /api/admin/api-keys/:id
POST   /api/admin/api-keys/:id/test
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/toggle
GET    /api/admin/feature-toggles
PUT    /api/admin/feature-toggles/:key
GET    /api/admin/audit-logs
GET    /api/admin/system/health
POST   /api/admin/system/clear-cache
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/ai-costs

# WEBHOOKS
POST /api/webhooks/meta
POST /api/webhooks/twilio
POST /api/webhooks/sendgrid
```

---

### MODULE 14: REALTIME WEBSOCKET EVENTS

```typescript
const WS_EVENTS = {
  'trend:new': { keyword, score, division, matched_products },
  'trend:breaking': { keyword, score, source, suggested_post },
  'content:generating': { job_id, count },
  'content:ready': { job_id, posts: SocialPost[] },
  'competitor:scan_started': { competitor_name },
  'competitor:scan_complete': { competitor_name, gaps_found, ads_found },
  'post:publishing': { post_id, platform },
  'post:published': { post_id, platform, url, engagement },
  'post:failed': { post_id, platform, error },
  'lead:new': { lead, source, score },
  'lead:qualified': { lead_id, grade, score },
  'campaign:started': { campaign_id, type, recipient_count },
  'campaign:progress': { campaign_id, sent, remaining },
  'campaign:complete': { campaign_id, stats },
  'system:budget_warning': { service, spent, limit },
  'system:api_error': { service, error },
}
```

---

### MODULE 15: SECURITY & COMPLIANCE

```typescript
const SECURITY_RULES = {
  jwt_access_expiry: '15m',
  jwt_refresh_expiry: '7d',
  password_hash_rounds: 12,
  encryption_algorithm: 'AES-256-GCM',
  admin_routes: '/admin/*',
  user_routes: '/dashboard/*',
  api_rate_limit: '100 requests per minute per user',
  scraping_rate_limit: '5 Apify jobs per hour',
  ai_rate_limit: '50 Claude requests per hour',
  whatsapp_opt_out: 'STOP keyword removes from all lists',
  whatsapp_templates: 'Pre-approved through Meta Business Manager',
  lead_data_encryption: 'Phone numbers and emails encrypted at rest',
  audit_logging: 'Every admin action logged with IP + timestamp',
}
```

---

### MODULE 16: VERCEL DEPLOYMENT CONFIGURATION

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['insforge', 'bullmq', 'sharp']
  },
  images: {
    remotePatterns: [
      { hostname: '*.vercel-storage.com' },
      { hostname: '*.r2.dev' },
      { hostname: 'roshanalinfotech.com' }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ]
      }
    ]
  }
}
```

```
// Required Vercel Environment Variables

# Core
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Insforge
INSFORGE_API_KEY=
INSFORGE_PROJECT_URL=

# Upstash Redis (for BullMQ queues)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Scraping
APIFY_API_TOKEN=
GOOGLE_TRENDS_API_KEY=
NEWS_API_KEY=
GOOGLE_MAPS_API_KEY=

# Social Media
META_APP_ID=
META_APP_SECRET=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TIKTOK_APP_ID=
TIKTOK_APP_SECRET=
YOUTUBE_API_KEY=
TELEGRAM_BOT_TOKEN=

# Communication
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Storage
BLOB_READ_WRITE_TOKEN=

# Encryption (for API key vault)
ENCRYPTION_SECRET=
ENCRYPTION_IV=

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ADMIN_EMAIL=
```

---

### MODULE 17: HOMEPAGE (Public Marketing Page)

**Sections:**
1. Hero — "Roshanal AI: Your 24/7 Marketing Engine"
2. What It Does — 6 feature cards (Content AI, Competitor Spy, UGC Ads, Trend Monitor, Lead Gen, Social Automation)
3. Live Demo Preview — Animated mockup of the dashboard
4. Platform Integrations — Logo wall (all connected APIs)
5. Contact/Login CTA

---

## ADDITIONAL FEATURES TO IMPLEMENT

- Content Repurposing Engine
- WhatsApp Auto-Responder
- Google Business Profile Automation
- Content Performance Learning
- UGC Video Brief Generator
- Testimonial Request System
- Email Newsletter
- Instagram DM Automation

---

## GIT WORKFLOW

- Remote: https://github.com/shuddi1962/Rosh-Workflow.git
- All commits pushed to `main` branch
- Commit after each meaningful change

---

## PROGRESS TRACKING

### Phase 1 — Foundation (Week 1)
- [ ] 1.1 Next.js 14 project setup + Vercel deployment
- [ ] 1.2 Insforge connection + all schema creation
- [ ] 1.3 Environment config with startup validation
- [ ] 1.4 Auth system (login/logout/JWT/RBAC)
- [ ] 1.5 Admin and User layout shells
- [ ] 1.6 API Key vault (admin)

### Phase 2 — Content Brain (Week 2)
- [ ] 2.1 Business profile + product catalog (Admin)
- [ ] 2.2 Live trend fetching (Google Trends + News API)
- [ ] 2.3 Content Brain Box UI + Claude content generation
- [ ] 2.4 Social post creation + saving to Insforge
- [ ] 2.5 Platform-specific formatting

### Phase 3 — Competitor Intel (Week 3)
- [ ] 3.1 Apify integration for competitor scraping
- [ ] 3.2 Facebook Meta Ad Library scraping
- [ ] 3.3 Competitor analysis with Claude
- [ ] 3.4 "What We're Not Doing" report
- [ ] 3.5 "Steal This Ad" feature

### Phase 4 — Social Automation (Week 4)
- [ ] 4.1 OAuth connections (Meta, Twitter, LinkedIn)
- [ ] 4.2 WhatsApp Business API integration
- [ ] 4.3 Post scheduler + calendar view
- [ ] 4.4 Auto-publish queue with rate limit protection
- [ ] 4.5 Engagement tracking

### Phase 5 — UGC Ad Creator (Week 5)
- [ ] 5.1 All UGC ad type generation (Claude API)
- [ ] 5.2 Video script generator
- [ ] 5.3 Ad preview cards
- [ ] 5.4 Export and scheduling integration

### Phase 6 — Campaigns + Leads (Week 6)
- [ ] 6.1 Apify lead scraping (Google Maps + LinkedIn)
- [ ] 6.2 Lead management CRM view
- [ ] 6.3 Email campaigns (SendGrid)
- [ ] 6.4 WhatsApp broadcasts (Meta API)
- [ ] 6.5 SMS campaigns (Twilio)

### Phase 7 — Analytics + Polish (Week 7)
- [ ] 7.1 Analytics dashboard
- [ ] 7.2 Real-time WebSocket events
- [ ] 7.3 Audit logs
- [ ] 7.4 Mobile responsiveness
- [ ] 7.5 Performance optimization for Vercel
