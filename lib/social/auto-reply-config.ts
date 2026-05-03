export const AUTO_REPLY_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', triggers: ['comment', 'dm', 'story_reply', 'mention'] },
  { id: 'facebook', name: 'Facebook', icon: '📘', triggers: ['comment', 'dm', 'page_review', 'mention'] },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', triggers: ['message', 'reaction', 'order_message'] },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', triggers: ['mention', 'reply', 'dm'] },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', triggers: ['comment', 'dm'] },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', triggers: ['comment', 'message'] },
  { id: 'google_business', name: 'Google Business', icon: '🗺', triggers: ['review', 'q_and_a'] },
  { id: 'telegram', name: 'Telegram', icon: '✈️', triggers: ['message', 'group_mention'] },
]

export interface KeywordTrigger {
  id: string
  keywords: string[]
  platform: string
  reply_template: Record<string, string>
  action: string
  tag_product: string
  is_active: boolean
  fire_count: number
}

export const DEFAULT_KEYWORD_TRIGGERS: KeywordTrigger[] = [
  {
    id: 'price-inquiry',
    keywords: ['price', 'how much', 'cost', 'pricing', 'rate', 'kudi', 'owo'],
    platform: 'all',
    reply_template: {
      instagram: "Hi {{name}}! 😊 For pricing on all our products, kindly send us a DM or WhatsApp us on 08109522432. We'll respond immediately!",
      whatsapp: "Hello {{name}}! Thank you for reaching out. For specific pricing, please call/WhatsApp 08109522432 directly.",
      facebook: "Hi {{name}}! 😊 Please send us a message or call 08109522432 for current pricing on all our products. We'd love to help!",
      twitter: "Hi @{{handle}}! DM us or call 08109522432 for pricing info. We respond quickly! 😊",
      default: "For pricing inquiries, please contact us: 📞 08109522432 | WhatsApp: 08109522432",
    },
    action: 'send_catalog_dm',
    tag_product: '',
    is_active: true,
    fire_count: 0,
  },
  {
    id: 'location',
    keywords: ['location', 'where are you', 'address', 'where you dey', 'wia you dey'],
    platform: 'all',
    reply_template: {
      instagram: "📍 We're at:\n18A Rumuola/Rumuadaolu Road, PH (Main)\n41 Eastern Bypass, Opp NDDC, PH (Branch)\nYenegoa, Bayelsa (Branch)\n\nWe also DELIVER within Port Harcourt! Call 08109522432 😊",
      whatsapp: "📍 Our locations:\n\n*Main Office:* No 18A Rumuola/Rumuadaolu Road, Adjacent Town Hall, Port Harcourt\n\n*Branch Office 1:* 41 Eastern Bypass, Opp NDDC Building, Port Harcourt\n\n*Branch Office 2:* 223 Chief Melfold Okilo Way, Yenegoa, Bayelsa\n\nWe deliver to your location too! Call 08109522432",
      default: "📍 18A Rumuola Road, Port Harcourt | 41 Eastern Bypass, PH | Yenegoa, Bayelsa. We deliver! 08109522432",
    },
    action: 'none',
    tag_product: '',
    is_active: true,
    fire_count: 0,
  },
  {
    id: 'cctv',
    keywords: ['cctv', 'camera', 'surveillance', 'hikvision', 'security camera'],
    platform: 'all',
    reply_template: {
      whatsapp: "Hello {{name}}! 👋\n\nYes, we are an authorized Hikvision dealer in Port Harcourt! 🎥\n\nWe offer:\n✅ Hikvision CCTV systems (2, 4, 8, 16 channels)\n✅ Professional installation same day in PH\n✅ 1-year warranty on all systems\n✅ 24/7 technical support\n\nFor a FREE site survey and quote, call/WhatsApp: 08109522432",
      instagram: "Hi {{name}}! 😊 Yes! We're an authorized Hikvision dealer with professional installation in PH. DM us or call 08109522432 for a free site survey! 🎥🔒",
      default: "We stock genuine Hikvision CCTV systems! Professional installation in Port Harcourt. Call 08109522432 for free site survey.",
    },
    action: 'send_catalog_dm',
    tag_product: 'cctv',
    is_active: true,
    fire_count: 0,
  },
  {
    id: 'solar',
    keywords: ['solar', 'inverter', 'phcn', 'nepa', 'light', 'generator', 'power'],
    platform: 'all',
    reply_template: {
      whatsapp: "Hello {{name}}! 🌞\n\nYes! We provide complete solar power solutions for homes and businesses in Port Harcourt.\n\n⚡ Solar Panels + Inverter + Batteries\n⚡ LivFast Lithium Batteries (10+ year lifespan)\n⚡ Professional installation\n⚡ Zero PHCN dependency\n\nSay goodbye to generator bills! 💪\n\nFor free assessment and quote: 08109522432",
      instagram: "We can end your PHCN stress! ☀️ Complete solar installation in Port Harcourt. Genuine LivFast lithium batteries. Call 08109522432 for free home assessment!",
      default: "Solar solutions for Port Harcourt homes/businesses. End PHCN stress! Call 08109522432.",
    },
    action: 'send_catalog_dm',
    tag_product: 'solar',
    is_active: true,
    fire_count: 0,
  },
  {
    id: 'marine',
    keywords: ['outboard', 'engine', 'boat engine', 'suzuki', 'yamaha', 'hp', 'horsepower'],
    platform: 'all',
    reply_template: {
      whatsapp: "Hello {{name}}! 🚤\n\nWe are authorized dealers for Suzuki and Yamaha outboard engines in Port Harcourt!\n\nAvailable HP: 15HP | 25HP | 40HP | 60HP | 70HP | 100HP | 150HP | 200HP | 300HP\n\n✅ Genuine engines with warranty\n✅ Spare parts available\n✅ Expert servicing\n✅ Delivery within Niger Delta\n\nFor pricing and availability: 08109522432",
      instagram: "🚤 Genuine Suzuki & Yamaha outboard engines in PH! All HP available. Warranty included. DM us or call 08109522432!",
      default: "We stock genuine Suzuki & Yamaha outboard engines. All HP available in Port Harcourt. 08109522432",
    },
    action: 'send_catalog_dm',
    tag_product: 'marine',
    is_active: true,
    fire_count: 0,
  },
  {
    id: 'tracker',
    keywords: ['tracker', 'gps', 'car tracker', 'vehicle tracker', 'stolen car'],
    platform: 'all',
    reply_template: {
      whatsapp: "Hello {{name}}! 📡\n\nProtect your vehicle with our GPS Car Tracker system!\n\n✅ Real-time tracking on your phone\n✅ Works anywhere in Nigeria\n✅ Instant theft alerts\n✅ Professional installation in PH\n✅ Monthly subscription plans available\n\nDon't wait until your car is stolen! Call 08109522432",
      default: "GPS Car Trackers available! Real-time tracking, theft alerts. Professional install in PH. 08109522432",
    },
    action: 'send_catalog_dm',
    tag_product: 'car_tracker',
    is_active: true,
    fire_count: 0,
  },
  {
    id: 'opt-out',
    keywords: ['stop', 'unsubscribe', 'remove me', "don't message", 'block'],
    platform: 'whatsapp',
    reply_template: {
      whatsapp: "We have removed you from our broadcast list as requested. We respect your preference.\n\nIf you ever need marine or security equipment in future, we're here at 08109522432.\n\nHave a great day! 🙏",
    },
    action: 'opt_out_lead',
    tag_product: '',
    is_active: true,
    fire_count: 0,
  },
]

export const AUTO_REPLY_MASTER_PROMPT = `You are the social media auto-responder for Roshanal Infotech Limited, Port Harcourt, Nigeria.

COMPANY KNOWLEDGE:
- Marine Division: Outboard engines (Suzuki, Yamaha), fiberglass boats, marine accessories, safety equipment
- Tech Division: Hikvision CCTV, solar systems, smart locks, car trackers, walkie-talkies, fire alarms
- Addresses: 18A Rumuola/Rumuadaolu Road, PH | 41 Eastern Bypass, Opp NDDC, PH | Yenegoa, Bayelsa
- Contacts: 08109522432 | 08033170802 | 08180388018 | info@roshanalinfotech.com
- Website: roshanalinfotech.com

PLATFORM: {{platform}}
INCOMING MESSAGE: {{incoming_text}}
CUSTOMER NAME: {{customer_name}}

INTENT DETECTION — Classify the incoming message as one of:
PRICE_INQUIRY, PRODUCT_INFO, AVAILABILITY, LOCATION, ORDER_INTENT, COMPLAINT, GENERAL_PRAISE, GENERAL_QUESTION, SPAM_OR_IRRELEVANT, COMPETITOR_MENTION

RESPONSE RULES:
1. Be warm, professional, Nigerian-market appropriate
2. Never give exact prices in public replies — always redirect to WhatsApp/call
3. For PRICE_INQUIRY: "DM us on WhatsApp 08109522432 for current pricing 😊"
4. For PRODUCT_INFO: Give 2-3 key benefits, then redirect to WhatsApp
5. For AVAILABILITY: "Yes, we have [product] in stock! Kindly reach us on 08109522432"
6. For LOCATION: Give address + "We also deliver within Port Harcourt"
7. For ORDER_INTENT: "Wonderful! Please DM us or call 08109522432 to place your order"
8. For COMPLAINT: Apologize sincerely, promise to resolve, ask them to DM privately
9. For PRAISE: Thank them warmly, invite them to leave a Google review
10. For platform-specific length: Instagram ≤150 chars | Twitter ≤240

Return ONLY valid JSON:
{"intent": "string", "should_reply": true, "reply_text": "string", "follow_up_action": "none|send_dm|create_lead|notify_team", "should_create_lead": true, "priority": "high|medium|low", "sentiment": "positive|neutral|negative"}`
