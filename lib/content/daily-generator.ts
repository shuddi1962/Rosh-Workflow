// lib/content/daily-generator.ts

interface TrendData {
  keyword: string
  description: string
  source: string
  momentum: number
  division: 'marine' | 'tech' | 'both'
}

interface ContentIdea {
  division: string
  post_type: string
  platform: string
  caption: string
  hashtags: string[]
  cta: string
  trend_keyword?: string
  trend_source?: string
  urgency: 'high' | 'medium' | 'low'
  image_prompt?: string
}

const ROSHANAL_CONTACT = {
  phones: '08109522432 | 08033170802 | 08180388018',
  email: 'info@roshanalinfotech.com',
  address: 'No 18A Rumuola/Rumuadaolu Road, Port Harcourt',
  whatsapp: 'https://wa.me/2348109522432'
}

const MARINE_PRODUCTS = [
  'Suzuki Outboard Engines (15HP-300HP)',
  'Yamaha Outboard Engines',
  'Fiberglass Boats (patrol, speedboat, passenger)',
  'Marine Safety Equipment (life jackets, ring buoys)',
  'Bilge Pumps & Marine Electronics',
  'Boat Fenders & Accessories',
  'Fiberglass Chemicals & Repair Materials',
  'Marine Navigation Lights'
]

const TECH_PRODUCTS = [
  'Hikvision CCTV Cameras (dome, bullet, PTZ)',
  'Solar Power Systems & Lithium Batteries',
  'Smart Door Locks & Access Control',
  'Car Trackers & GPS',
  'Walkie-Talkies & Two-Way Radios',
  'Fire Alarm Systems',
  'Complete Surveillance Systems',
  'Biometric Access Control'
]

const CONTENT_TYPES = {
  marine: [
    'PRODUCT SPOTLIGHT',
    'NEW ARRIVAL',
    'EDUCATIONAL',
    'PROBLEM-SOLUTION',
    'SAFETY TIP',
    'COMPARISON',
    'SEASONAL',
    'URGENCY',
    'TESTIMONIAL',
    'BEHIND THE SCENES'
  ],
  tech: [
    'SECURITY AWARENESS',
    'POWER CRISIS CONTENT',
    'PRODUCT DEMO',
    'INSTALLATION HIGHLIGHT',
    'SAVINGS CALCULATOR',
    'SMART HOME TIP',
    'PACKAGE DEAL',
    'MAINTENANCE REMINDER',
    'CASE STUDY',
    'TECHNICAL TIP'
  ]
}

const PLATFORM_STRATEGY = {
  marine: {
    best_platforms: ['facebook', 'instagram', 'whatsapp'],
    posting_times: ['07:00', '12:00', '19:00'],
    style: 'professional, benefit-focused, local context'
  },
  tech: {
    best_platforms: ['facebook', 'instagram', 'linkedin', 'whatsapp'],
    posting_times: ['08:00', '13:00', '20:00'],
    style: 'urgent, security-focused, practical'
  }
}

async function fetchNigerianTrends(): Promise<TrendData[]> {
  const trends: TrendData[] = []

  try {
    const { getApiKey } = await import('@/lib/env')
    const newsApiKey = await getApiKey('news_api', 'API Key')
    
    if (newsApiKey) {
      const businessKeywords = [
        "outboard engine Nigeria",
        "fiberglass boat Nigeria",
        "marine equipment Nigeria",
        "Suzuki marine Nigeria",
        "Yamaha boat engine Nigeria",
        "maritime security Niger Delta",
        "NIMASA Nigeria",
        "CCTV Nigeria",
        "Hikvision Nigeria",
        "solar power Nigeria",
        "surveillance Port Harcourt",
        "solar battery lithium Nigeria",
        "car tracker Nigeria",
        "smart door lock Nigeria",
        "fire alarm Nigeria",
        "biometric access control Nigeria",
        "power outage Port Harcourt",
        "PHCN electricity Nigeria",
        "walkie talkie Nigeria",
        "generator diesel Nigeria"
      ]

      const seenUrls = new Set<string>()

      for (const keyword of businessKeywords) {
        try {
          const res = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&pageSize=2&apiKey=${newsApiKey}`,
            { next: { revalidate: 3600 } }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.articles && data.articles.length > 0) {
              for (const article of data.articles.slice(0, 2)) {
                if (!article.url || seenUrls.has(article.url)) continue
                const title = (article.title || '').toLowerCase()
                const desc = (article.description || '').toLowerCase()
                const content = title + ' ' + desc
                
                const marineSignals = /marine|boat|ship|water|engine|outboard|suzuki|yamaha|fiberglass|maritime|niger delta|oil.*gas|waterway|port.*harcourt|bonny|river|transport|navigat|vessel|dock|harbor/i.test(content)
                const techSignals = /cctv|camera|surveillance|hikvision|solar|battery|power|electricity|phcn|security|smart.*lock|access.*control|car.*tracker|gps|fire.*alarm|biometric|fingerprint|walkie|intercom|generator|inverter|renewable|grid/i.test(content)
                
                if (!marineSignals && !techSignals) continue

                seenUrls.add(article.url)
                trends.push({
                  keyword: article.title,
                  description: article.description || '',
                  source: 'NewsAPI',
                  momentum: Math.floor(Math.random() * 40) + 60,
                  division: marineSignals ? 'marine' : techSignals ? 'tech' : 'both'
                })

                if (trends.length >= 10) break
              }
            }
          }
          if (trends.length >= 10) break
        } catch (e) {
          console.log('NewsAPI fetch failed for:', keyword)
        }
      }
    }
  } catch (e) {
    console.log('NewsAPI fetch failed, using fallback trends')
  }

  try {
    const res = await fetch('https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom', { next: { revalidate: 3600 } })
    if (res.ok) {
      const text = await res.text()
      const matches = text.match(/<title>(.*?)<\/title>/g)
      matches?.slice(1, 6).forEach((match) => {
        const title = match.replace(/<\/?title>/g, '')
        trends.push({
          keyword: title,
          description: 'Featured Wikipedia topic',
          source: 'Wikipedia',
          momentum: Math.floor(Math.random() * 30) + 40,
          division: 'both'
        })
      })
    }
  } catch (e) {
    console.log('Wikipedia fetch failed')
  }

  const fallbackTrends: TrendData[] = [
    { keyword: 'Suzuki outboard engine prices Nigeria 2026', description: 'Latest pricing and availability for Suzuki marine engines in Port Harcourt', source: 'Marine Market', momentum: 90, division: 'marine' },
    { keyword: 'PHCN power supply update Port Harcourt', description: 'Electricity supply status driving solar demand in Rivers State', source: 'Local Context', momentum: 88, division: 'tech' },
    { keyword: 'Solar inverter and battery prices Nigeria', description: 'Lithium battery costs dropping making solar affordable for homes and businesses', source: 'Energy Market', momentum: 85, division: 'tech' },
    { keyword: 'Niger Delta maritime security update', description: 'Security situation affecting boat operators and marine equipment demand', source: 'Maritime', momentum: 82, division: 'marine' },
    { keyword: 'Hikvision CCTV surveillance demand Nigeria', description: 'Growing demand for professional CCTV installation in Port Harcourt', source: 'Security Market', momentum: 80, division: 'tech' },
    { keyword: 'Fiberglass boat repair Niger Delta', description: 'Increasing need for fiberglass boat repair services in Rivers and Bayelsa', source: 'Marine Services', momentum: 78, division: 'marine' },
    { keyword: 'Smart door lock and biometric access control Nigeria', description: 'Growing adoption of smart security systems in Nigerian homes and offices', source: 'Tech Market', momentum: 75, division: 'tech' },
    { keyword: 'Car tracker and GPS vehicle tracking Nigeria', description: 'Rising vehicle theft driving demand for GPS tracking in Port Harcourt', source: 'Auto Security', momentum: 72, division: 'tech' }
  ]

  if (trends.length < 5) {
    trends.push(...fallbackTrends.slice(0, 8 - trends.length))
  }

  return trends.slice(0, 10)
}

function generateIdeaFromTrend(trend: TrendData, dayIndex: number): ContentIdea {
  const division = trend.division === 'both' ? (dayIndex % 2 === 0 ? 'marine' : 'tech') : trend.division
  const products = division === 'marine' ? MARINE_PRODUCTS : TECH_PRODUCTS
  const postTypes = CONTENT_TYPES[division]
  const strategy = PLATFORM_STRATEGY[division]
  const product = products[dayIndex % products.length]
  const postType = postTypes[dayIndex % postTypes.length]
  const platform = strategy.best_platforms[dayIndex % strategy.best_platforms.length]

  const captions = generateCaptions(division, postType, product, trend, strategy.style)

  const hashtags = generateHashtags(division, postType)
  const cta = generateCTA(division)
  const urgency = trend.momentum > 80 ? 'high' : trend.momentum > 60 ? 'medium' : 'low'

  const imagePrompt = generateImagePrompt(division, postType, product)

  return {
    division,
    post_type: postType,
    platform,
    caption: captions[dayIndex % captions.length],
    hashtags,
    cta,
    trend_keyword: trend.keyword,
    trend_source: trend.source,
    urgency,
    image_prompt: imagePrompt
  }
}

function generateCaptions(division: string, postType: string, product: string, trend: TrendData, style: string): string[] {
  if (division === 'marine') {
    return [
      `🚢 ${product} — Built for the Niger Delta waters! Whether you're on the Bonny River or managing oil & gas marine operations, reliability is everything.\n\n✅ Genuine Suzuki/Yamaha parts\n✅ Immediate delivery from PH warehouse\n✅ Expert installation & support\n\nDon't wait until your engine fails mid-sea. DM us now or call ${ROSHANAL_CONTACT.phones}\n\n📍 Visit us: ${ROSHANAL_CONTACT.address}\n💬 WhatsApp: ${ROSHANAL_CONTACT.whatsapp}`,

      `⚠️ TRENDING: ${trend.keyword}\n\nThis affects every boat operator in Rivers State and Bayelsa. At Roshanal Infotech, we understand the challenges of ${trend.description.toLowerCase()}\n\nThat's why we stock ${product} — ready for immediate delivery in Port Harcourt.\n\n🔧 Genuine parts\n🔧 Expert fitting\n🔧 Oil & gas certified\n\n📞 Call now: ${ROSHANAL_CONTACT.phones}\n📍 ${ROSHANAL_CONTACT.address}`,

      `🌊 Niger Delta boat operators: ${trend.keyword} is making headlines. But what does this mean for YOUR operations?\n\n${product} from Roshanal Infotech keeps you running when it matters most.\n\n✅ In stock at PH warehouse\n✅ No Lagos trips needed\n✅ Competitive pricing\n\nDM us on WhatsApp: ${ROSHANAL_CONTACT.phones}`,

      `📢 NEW: ${product} now available in Port Harcourt!\n\nFor oil & gas marine operators, commercial boat owners, and fishing vessel captains — this is what you've been waiting for.\n\nWhy Roshanal?\n✓ Authorized Suzuki & Yamaha dealer\n✓ Local PH stock (no import delays)\n✓ Professional installation available\n✓ Compliance-certified for O&G operations\n\n📞 ${ROSHANAL_CONTACT.phones}\n📧 ${ROSHANAL_CONTACT.email}`,

      `💡 Did you know? ${trend.keyword} directly impacts marine safety in the Niger Delta.\n\nAt Roshanal Infotech Limited, we provide ${product} that meets oil & gas marine compliance standards.\n\n🔸 Same-day availability in PH\n🔸 Expert technical support\n🔸 Genuine parts with warranty\n\nProtect your crew. Protect your vessel.\n\n📲 WhatsApp: ${ROSHANAL_CONTACT.phones}\n📍 ${ROSHANAL_CONTACT.address}`
    ]
  }

  return [
    `🔒 ${product} — Because security can't wait in Port Harcourt.\n\nWith the recent ${trend.keyword}, more homes and businesses in GRA, Rumuola, and Trans Amadi are upgrading their security.\n\n✅ Professional installation by certified technicians\n✅ 24/7 monitoring support\n✅ Genuine Hikvision products with warranty\n\nDon't be the next victim. DM us now.\n\n📞 ${ROSHANAL_CONTACT.phones}\n📍 ${ROSHANAL_CONTACT.address}\n💬 WhatsApp: ${ROSHANAL_CONTACT.whatsapp}`,

    `⚡ ${trend.keyword} — Is this happening in your area?\n\nWhile PHCN keeps disappointing, our solar systems keep you running 24/7. ${product} means no more:\n\n❌ Diesel generator noise\n❌ Fuel costs eating your profits\n❌ Unpredictable power supply\n\nSwitch to solar. Switch to peace of mind.\n\n🔋 Free consultation: ${ROSHANAL_CONTACT.phones}\n📍 ${ROSHANAL_CONTACT.address}`,

    `📹 ${product} — See everything. Miss nothing.\n\nPerfect for:\n🏠 Homes & estates in GRA, Port Harcourt\n🏢 Offices & businesses\n🏦 Banks & financial institutions\n🏨 Hotels & guesthouses\n\nWhy choose Roshanal Infotech?\n✓ Hikvision authorized dealer\n✓ Same-day installation in PH metropolis\n✓ Best prices — no middleman markup\n✓ 24/7 technical support\n\n📲 WhatsApp: ${ROSHANAL_CONTACT.phones}`,

    `🚨 ${trend.keyword}\n\nThis is exactly why every home, bank, and business in Port Harcourt needs reliable ${product.toLowerCase()} NOW.\n\nRoshanal Infotech Limited delivers:\n🔸 Professional installation\n🔸 Genuine products with warranty\n🔸 Remote viewing on your phone\n🔸 Affordable payment plans\n\nSecure your property today.\n\n📞 Call: ${ROSHANAL_CONTACT.phones}\n📧 ${ROSHANAL_CONTACT.email}`,

    `💡 Smart Tip: ${trend.keyword} doesn't have to affect YOUR security.\n\n${product} from Roshanal Infotech keeps you protected even when the grid fails.\n\n✨ Battery backup options available\n✨ Remote monitoring via phone\n✨ Professional installation included\n\n📍 Visit us: ${ROSHANAL_CONTACT.address}\n📲 WhatsApp: ${ROSHANAL_CONTACT.phones}`
  ]
}

function generateHashtags(division: string, postType: string): string[] {
  const base = [
    '#RoshanalInfotech',
    '#PortHarcourt',
    '#RiversState',
    '#NigerDelta',
    '#Nigeria'
  ]

  const marine = [
    '#MarineEquipment',
    '#OutboardEngine',
    '#SuzukiMarine',
    '#YamahaMarine',
    '#FiberglassBoat',
    '#NigerDeltaBoats',
    '#BonnyRiver',
    '#MarineSafety',
    '#OilAndGasNigeria',
    '#PortHarcourtBusiness'
  ]

  const tech = [
    '#CCTVInstallation',
    '#HikvisionNigeria',
    '#SolarPowerNigeria',
    '#SmartHomeNigeria',
    '#SecuritySystem',
    '#PortHarcourtSecurity',
    '#SolarEnergy',
    '#CarTracker',
    '#AccessControl',
    '#TechNigeria'
  ]

  return [...base, ...(division === 'marine' ? marine : tech).slice(0, 6)]
}

function generateCTA(division: string): string {
  return division === 'marine'
    ? `📲 DM us on WhatsApp: ${ROSHANAL_CONTACT.phones}`
    : `📲 Call/WhatsApp: ${ROSHANAL_CONTACT.phones}`
}

function generateImagePrompt(division: string, postType: string, product: string): string {
  if (division === 'marine') {
    return `Professional photography of ${product} on a boat in Niger Delta waters, Nigeria, bright daylight, ocean background, professional marine equipment showcase, high quality, realistic`
  }
  return `Professional ${product.toLowerCase()} installation in modern Port Harcourt home, clean setup, professional security camera or solar panel, Nigeria, realistic, high quality, professional photography`
}

export async function generateDailyIdeas(): Promise<ContentIdea[]> {
  const trends = await fetchNigerianTrends()
  const ideas: ContentIdea[] = []

  trends.forEach((trend, index) => {
    const marineIdea = generateIdeaFromTrend({ ...trend, division: 'marine' }, index)
    const techIdea = generateIdeaFromTrend({ ...trend, division: 'tech' }, index + 1)
    ideas.push(marineIdea, techIdea)
  })

  const additionalIdeas: ContentIdea[] = [
    {
      division: 'marine',
      post_type: 'FAQ',
      platform: 'facebook',
      caption: `❓ "Where can I buy genuine outboard engine parts in Port Harcourt?"\n\nThis is the #1 question we get from boat operators in Rivers State and Bayelsa.\n\nThe answer: Roshanal Infotech Limited.\n\n✅ Authorized Suzuki & Yamaha dealer\n✅ Full parts inventory in PH warehouse\n✅ Expert mechanics on staff\n✅ Same-day pickup available\n\nStop wasting money on fake parts. Buy genuine.\n\n📞 ${ROSHANAL_CONTACT.phones}\n📍 ${ROSHANAL_CONTACT.address}\n💬 WhatsApp: ${ROSHANAL_CONTACT.whatsapp}`,
      hashtags: generateHashtags('marine', 'FAQ'),
      cta: generateCTA('marine'),
      urgency: 'medium',
      image_prompt: 'Fiberglass boat with Suzuki outboard engine at Port Harcourt marina, professional photography, Nigeria'
    },
    {
      division: 'tech',
      post_type: 'URGENCY',
      platform: 'instagram',
      caption: `⚠️ PHCN OFF AGAIN? Don't let darkness stop your business.\n\nOur solar + battery systems keep you running 24/7, even when the grid is down for days.\n\n🔋 Complete solar installation\n🔋 Lithium battery backup\n🔋 Professional setup in PH metropolis\n🔋 Affordable payment plans\n\nJoin 500+ homes and businesses in Port Harcourt who've made the switch.\n\n📲 WhatsApp: ${ROSHANAL_CONTACT.phones}\n📍 ${ROSHANAL_CONTACT.address}`,
      hashtags: generateHashtags('tech', 'URGENCY'),
      cta: generateCTA('tech'),
      urgency: 'high',
      image_prompt: 'Modern home in Port Harcourt with solar panels on roof, bright sunny day, professional installation, Nigeria'
    }
  ]

  return [...ideas, ...additionalIdeas]
}

export { generateCaptions, generateHashtags, generateCTA, generateImagePrompt }
export type { ContentIdea }
