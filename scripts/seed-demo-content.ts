import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const uid = () => crypto.randomUUID()

const PRODUCTS = [
  { division: 'marine', category: 'Outboard Engines', brand: 'Suzuki', name: 'Suzuki DF140A Outboard Engine', model: 'DF140A', description: '140HP 4-stroke outboard engine with lean burn fuel control. Perfect for patrol boats, passenger ferries and offshore crew transfer vessels operating in the Niger Delta.', features: ['140HP 4-stroke DOHC', 'Lean Burn fuel efficiency', 'Suzuki anti-corrosion finish', 'Power trim & tilt'], specifications: { horsepower: '140HP', weight: '182kg', fuel: 'Petrol', warranty: '2 years' }, price_naira: 18500000, price_display: '₦18,500,000', images: [], keywords: ['suzuki', 'outboard', '140hp', 'boat engine'], is_new_arrival: true, is_featured: true, is_available: true, warranty: '2-year warranty', installation_required: true, installation_area: ['Port Harcourt', 'Yenagoa', 'Warri'] },
  { division: 'marine', category: 'Outboard Engines', brand: 'Yamaha', name: 'Yamaha F100XB Outboard Engine', model: 'F100XB', description: '100HP EFI outboard with high-thrust propeller option. The workhorse for commercial fishing boats and river transport on the Bonny River.', features: ['100HP EFI', 'High-thrust prop option', 'Yamaha Y-COP immobiliser', 'Low noise operation'], specifications: { horsepower: '100HP', weight: '170kg', fuel: 'Petrol' }, price_naira: 14200000, price_display: '₦14,200,000', images: [], keywords: ['yamaha', 'outboard', '100hp'], is_new_arrival: false, is_featured: true, is_available: true, warranty: '2-year warranty', installation_required: true, installation_area: ['Port Harcourt', 'Yenagoa'] },
  { division: 'marine', category: 'Fiberglass Boats', brand: 'Roshanal Marine', name: '24ft Fiberglass Patrol Boat', model: 'RMP-24', description: 'Locally built 24ft fiberglass patrol boat with twin-engine transom, console steering and safety rails. Ideal for oil & gas security and marine police operations.', features: ['Twin-engine transom', 'Console steering', 'Safety rails + navigation lights', 'Unsinkable foam core'], specifications: { length: '24ft', capacity: '12 persons', hull: 'Fiberglass' }, price_naira: 28500000, price_display: '₦28,500,000', images: [], keywords: ['fiberglass', 'patrol boat', 'security boat'], is_new_arrival: true, is_featured: true, is_available: true, warranty: '1-year hull warranty', installation_required: false, installation_area: ['Port Harcourt'] },
  { division: 'marine', category: 'Safety Equipment', brand: 'Generic', name: 'Marine Life Jacket (SOLAS)', model: 'LJ-SOLAS', description: 'SOLAS-approved life jackets in bulk for crew, passengers and offshore personnel. NIMASA compliance guaranteed.', features: ['SOLAS approved', 'Reflective tape', 'Whistle + light loop', 'Sizes M-XXL'], specifications: { standard: 'SOLAS', buoyancy: '150N' }, price_naira: 25000, price_display: '₦25,000', images: [], keywords: ['life jacket', 'safety', 'solas'], is_new_arrival: false, is_featured: false, is_available: true, installation_required: false, installation_area: ['Port Harcourt', 'Lagos'] },
  { division: 'tech', category: 'CCTV & Surveillance', brand: 'Hikvision', name: 'Hikvision 4MP Outdoor Bullet Camera', model: 'DS-2CD2043G0-I', description: '4MP EXIR bullet camera with 30m night vision and IP67 weatherproofing. Crystal-clear footage for homes, estates and offices in Port Harcourt.', features: ['4MP 2560x1440', '30m EXIR night vision', 'IP67 weatherproof', 'H.265+ compression'], specifications: { resolution: '4MP', night_vision: '30m', rating: 'IP67' }, price_naira: 85000, price_display: '₦85,000', images: [], keywords: ['hikvision', 'cctv', 'bullet camera', '4mp'], is_new_arrival: false, is_featured: true, is_available: true, warranty: '1-year warranty', installation_required: true, installation_area: ['Port Harcourt', 'Yenagoa'] },
  { division: 'tech', category: 'CCTV & Surveillance', brand: 'Hikvision', name: 'Complete 8-Channel Home CCTV Kit', model: 'KIT-8CH-4MP', description: 'Everything for a full home security setup: 8-channel NVR, 6 bullet cameras, 2 dome cameras, 2TB HDD, cables and same-day installation in PH.', features: ['8CH NVR + 2TB HDD', '6 bullet + 2 dome cameras', 'Mobile app viewing', 'Same-day installation'], specifications: { channels: 8, storage: '2TB', cameras: 8 }, price_naira: 950000, price_display: '₦950,000', images: [], keywords: ['cctv kit', 'home security', 'nvr'], is_new_arrival: true, is_featured: true, is_available: true, warranty: '1-year warranty + free first service', installation_required: true, installation_area: ['Port Harcourt'] },
  { division: 'tech', category: 'Solar & Power', brand: 'LivFast', name: 'LivFast 3.5KVA Solar Inverter System', model: 'LF-3500', description: 'Complete solar solution for duplexes: 3.5KVA inverter, lithium battery bank, 8 panels. Say goodbye to PHCN wahala and diesel costs.', features: ['3.5KVA pure sine wave', 'Lithium battery bank', '8x 550W panels', 'Powers AC, freezer, pumps'], specifications: { capacity: '3.5KVA', battery: 'Lithium 10kWh', panels: '8x550W' }, price_naira: 4850000, price_display: '₦4,850,000', images: [], keywords: ['solar', 'inverter', 'livfast', 'phcn alternative'], is_new_arrival: true, is_featured: true, is_available: true, warranty: '2-year warranty', installation_required: true, installation_area: ['Port Harcourt', 'Yenagoa', 'Owerri'] },
  { division: 'tech', category: 'Access Control', brand: 'Hikvision', name: 'Smart Fingerprint Door Lock', model: 'DS-K719BH', description: 'Open your door with fingerprint, PIN, card or phone app. Perfect for short-let apartments, offices and hotels.', features: ['Fingerprint + PIN + card + app', 'Fake-PIN anti-peep', 'USB emergency power', 'Entry logs on phone'], specifications: { unlock_modes: 4, battery: '8x AA, 12 months' }, price_naira: 185000, price_display: '₦185,000', images: [], keywords: ['smart lock', 'fingerprint', 'access control'], is_new_arrival: false, is_featured: false, is_available: true, warranty: '1-year warranty', installation_required: true, installation_area: ['Port Harcourt'] },
  { division: 'tech', category: 'Vehicle Tracking', brand: 'TrackPro', name: 'Car Tracker with Engine Cut-off', model: 'TP-GPS01', description: 'Real-time GPS tracker with engine immobiliser, geo-fence alerts and trip history. Recover your vehicle anywhere in Nigeria.', features: ['Real-time tracking app', 'Remote engine cut-off', 'Geo-fence alerts', 'Trip history + reports'], specifications: { network: '4G/GSM', backup_battery: 'Yes' }, price_naira: 65000, price_display: '₦65,000', images: [], keywords: ['car tracker', 'gps', 'vehicle security'], is_new_arrival: false, is_featured: false, is_available: true, warranty: '1-year warranty', installation_required: true, installation_area: ['Port Harcourt', 'Lagos', 'Abuja'] },
  { division: 'tech', category: 'Communication', brand: 'Motorola', name: 'Motorola Walkie-Talkie Pair (5KM)', model: 'TALKABOUT-T42', description: 'Rugged two-way radios with 5km range for construction sites, estates, hotels and event security teams.', features: ['5km range', '16 channels', 'Rechargeable + 18hr battery', 'Hands-free VOX'], specifications: { range: '5km', channels: 16 }, price_naira: 95000, price_display: '₦95,000 (pair)', images: [], keywords: ['walkie-talkie', 'two-way radio', 'motorola'], is_new_arrival: false, is_featured: false, is_available: true, installation_required: false, installation_area: ['Port Harcourt'] },
]

const LEADS = [
  { first_name: 'Tamuno', last_name: 'Briggs', full_name: 'Tamuno Briggs', email: 't.briggs@bonnymarine.ng', phone: '08033145521', company: 'Bonny Marine Logistics', job_title: 'Fleet Manager', country: 'Nigeria', state: 'Rivers', city: 'Bonny', division_interest: 'marine', product_interests: ['Suzuki DF140A', 'Fiberglass Patrol Boat'], customer_type: 'business', company_size: 'mid', industry: 'Oil & Gas', stage: 'qualified', score: 86, tier: 'hot', qualification_status: 'qualified', qualification_grade: 'A', source: 'whatsapp_inquiry', tags: ['fleet', 'repeat-buyer'], notes: 'Needs 2x 140HP engines for crew boats before end of quarter.', best_channel: 'whatsapp' },
  { first_name: 'Adaeze', last_name: 'Okafor', full_name: 'Adaeze Okafor', email: 'adaeze.o@gmail.com', phone: '08039551209', company: null, job_title: 'Homeowner', country: 'Nigeria', state: 'Rivers', city: 'Port Harcourt', division_interest: 'tech', product_interests: ['8-Channel CCTV Kit'], customer_type: 'individual', industry: 'Residential', stage: 'contacted', score: 72, tier: 'hot', qualification_status: 'pending', source: 'google', tags: ['gra', 'duplex'], notes: 'Duplex in GRA Phase 2. Wants installation this weekend.', best_channel: 'whatsapp' },
  { first_name: 'Ebiware', last_name: 'Johnson', full_name: 'Capt. Ebiware Johnson', email: 'ebi.j@deltaferries.com', phone: '08067702314', company: 'Delta Ferries Ltd', job_title: 'Marine Superintendent', country: 'Nigeria', state: 'Delta', city: 'Warri', division_interest: 'marine', product_interests: ['Yamaha F100XB', 'Life Jackets'], customer_type: 'business', company_size: 'mid', industry: 'Transport', stage: 'proposal_sent', score: 78, tier: 'warm', qualification_status: 'qualified', qualification_grade: 'B', source: 'referral', tags: ['ferry'], notes: 'Quote sent for 4 engines + 60 life jackets. Follow up Friday.', best_channel: 'email' },
  { first_name: 'Fatima', last_name: 'Bello', full_name: 'Fatima Bello', email: 'fatima@sunrisehotel.ng', phone: '08052219876', company: 'Sunrise Hotel & Suites', job_title: 'General Manager', country: 'Nigeria', state: 'Rivers', city: 'Port Harcourt', division_interest: 'tech', product_interests: ['Smart Door Lock', 'CCTV Kit'], customer_type: 'business', company_size: 'mid', industry: 'Hospitality', stage: 'new_lead', score: 64, tier: 'warm', qualification_status: 'pending', source: 'social_dm', tags: ['hotel', '22-rooms'], notes: '22-room hotel in Eliozu. Smart locks for all rooms + lobby CCTV.', best_channel: 'whatsapp' },
  { first_name: 'Chidi', last_name: 'Okafor', full_name: 'Chidi Okafor', email: 'chidi@zenithrealty.ng', phone: '08034417652', company: 'Zenith Prime Realty', job_title: 'MD', country: 'Nigeria', state: 'Rivers', city: 'Port Harcourt', division_interest: 'tech', product_interests: ['Solar Inverter System'], customer_type: 'business', company_size: 'mid', industry: 'Real Estate', stage: 'contacted', score: 69, tier: 'warm', qualification_status: 'pending', source: 'google', tags: ['estate'], notes: 'Marketing 12 units at Ibeju-style estate in Igwuruta. Solar as selling point.', best_channel: 'call' },
  { first_name: 'Samuel', last_name: 'Etim', full_name: 'Samuel Etim', email: 's.etim@nddc.gov.ng', phone: '08061120987', company: 'NDDC Contractor', job_title: 'Project Manager', country: 'Nigeria', state: 'Bayelsa', city: 'Yenagoa', division_interest: 'marine', product_interests: ['Fiberglass Patrol Boat'], customer_type: 'government', industry: 'Government', stage: 'new_lead', score: 58, tier: 'warm', qualification_status: 'pending', source: 'walk_in', tags: ['nddc'], notes: 'Waterway surveillance project. Needs specs + company profile.', best_channel: 'email' },
  { first_name: 'Ngozi', last_name: 'Eze', full_name: 'Ngozi Eze', email: 'ngozi.eze@firstbankprocure.com', phone: '08038881234', company: 'First Bank (PH Branch)', job_title: 'Procurement Officer', country: 'Nigeria', state: 'Rivers', city: 'Port Harcourt', division_interest: 'tech', product_interests: ['CCTV Kit', 'Fire Alarm'], customer_type: 'business', company_size: 'enterprise', industry: 'Banking', stage: 'qualified', score: 91, tier: 'hot', qualification_status: 'qualified', qualification_grade: 'A', source: 'referral', tags: ['bank', 'enterprise'], notes: 'Branch upgrade: 16 cameras + addressable fire alarm. Budget approved.', best_channel: 'email' },
  { first_name: 'Ibrahim', last_name: 'Musa', full_name: 'Ibrahim Musa', email: null, phone: '08051239876', company: null, job_title: 'Fisherman', country: 'Nigeria', state: 'Rivers', city: 'Okrika', division_interest: 'marine', product_interests: ['Yamaha F100XB'], customer_type: 'individual', industry: 'Fishing', stage: 'new_lead', score: 45, tier: 'cold', qualification_status: 'pending', source: 'walk_in', tags: ['fishing'], notes: 'Asking about engine spare parts and servicing.', best_channel: 'call' },
  { first_name: 'Kelechi', last_name: 'Opuiyo', full_name: 'Kelechi Opuiyo', email: 'k.opuiyo@transamadi.ng', phone: '08039991122', company: 'Trans-Amadi Logistics Park', job_title: 'Facility Manager', country: 'Nigeria', state: 'Rivers', city: 'Port Harcourt', division_interest: 'tech', product_interests: ['Car Tracker', 'Walkie-Talkie'], customer_type: 'business', company_size: 'mid', industry: 'Logistics', stage: 'contacted', score: 66, tier: 'warm', qualification_status: 'pending', source: 'social_dm', tags: ['fleet-30'], notes: '30-truck fleet. Trackers first, radios for yard staff next.', best_channel: 'whatsapp' },
  { first_name: 'Pastor', last_name: 'Amadi', full_name: 'Pastor F. Amadi', email: 'famadi@gracechapel.ng', phone: '08035556677', company: 'Grace Chapel Int.', job_title: 'Admin Pastor', country: 'Nigeria', state: 'Rivers', city: 'Port Harcourt', division_interest: 'tech', product_interests: ['Solar Inverter System'], customer_type: 'ngo', industry: 'Religious', stage: 'proposal_sent', score: 74, tier: 'warm', qualification_status: 'qualified', qualification_grade: 'B', source: 'referral', tags: ['church', 'referrer'], notes: 'Church auditorium + media unit on solar. Also our top referrer!', best_channel: 'whatsapp' },
]

const CAMPAIGNS = [
  { name: 'Suzuki Engine Promo Q3', type: 'whatsapp', division: 'marine', message_template: 'Hi {{first_name}}! Brand new Suzuki DF140A outboard engines just landed in our PH warehouse. Genuine parts, 2-year warranty, installation included. Reply YES for today-only price. — Roshanal Infotech, 08109522432', status: 'sent', sent_at: daysAgo(3), stats: { sent: 2340, delivered: 2210, read: 1890, replied: 214 }, created_at: daysAgo(6) },
  { name: 'CCTV Flash Sale — GRA Estates', type: 'whatsapp', division: 'tech', message_template: 'Hi {{first_name}}, protect your home this rainy season! Complete 8-camera Hikvision kit + same-day installation for ₦950,000 (was ₦1,150,000). Offer ends Sunday. Reply INSTALL. — Roshanal Infotech', status: 'sent', sent_at: daysAgo(7), stats: { sent: 4120, delivered: 3980, read: 3410, replied: 402 }, created_at: daysAgo(10) },
  { name: 'Solar vs Diesel Savings Email', type: 'email', division: 'tech', subject: 'How much is diesel costing you every month?', message_template: 'Dear {{first_name}}, with diesel at ₦1,200+/litre, a 3.5KVA solar system pays for itself in 18 months. See the maths + this month\'s 10% installation discount inside.', status: 'sent', sent_at: daysAgo(12), stats: { sent: 860, delivered: 812, opened: 402, clicked: 121 }, created_at: daysAgo(14) },
  { name: 'Hikvision Smart Lock Launch', type: 'sms', division: 'tech', message_template: 'Roshanal Infotech: New smart fingerprint locks from ₦185,000 — open doors with your finger or phone. Ideal for short-lets & offices. Call 08109522432. Reply STOP to opt out.', status: 'scheduled', scheduled_at: new Date(Date.now() + 86400000).toISOString(), stats: {}, created_at: daysAgo(1) },
  { name: 'Marine Safety Compliance Drive', type: 'email', division: 'marine', subject: 'NIMASA-compliant safety gear for your fleet', message_template: 'Hello {{first_name}}, is your fleet audit-ready? SOLAS life jackets, ring buoys and fire extinguishers in stock in Port Harcourt with same-week delivery to Bonny, Brass & Forcados.', status: 'draft', stats: {}, created_at: daysAgo(0) },
]

const TRENDS = [
  { keyword: 'outboard engine price Nigeria', topic: 'Suzuki/Yamaha prices rising on search', description: 'Search interest for outboard engine prices in Nigeria up 40% this month. Buyers comparing Suzuki vs Yamaha 100-140HP range.', source: 'Google Trends', momentum_score: 87, division_relevance: 'marine', is_breaking: true, discovered_at: daysAgo(0), status: 'active' },
  { keyword: 'PHCN outage Port Harcourt', topic: 'Blackout frustration peaks', description: 'Port Harcourt residents reporting 3+ day outages. Solar + inverter searches spiking — perfect moment for solar promo content.', source: 'News API', momentum_score: 94, division_relevance: 'tech', is_breaking: true, discovered_at: daysAgo(0), status: 'active' },
  { keyword: 'Hikvision camera price Nigeria', topic: 'CCTV buying intent high', description: 'Steady high search volume for Hikvision prices. Shoppers want transparent pricing and installation bundles.', source: 'Google Trends', momentum_score: 78, division_relevance: 'tech', is_breaking: false, discovered_at: daysAgo(1), status: 'active' },
  { keyword: 'boat mishap Bonny River', topic: 'Waterway safety in the news', description: 'Recent boat incident on Bonny River driving conversation about life jackets and marine safety compliance.', source: 'News API', momentum_score: 82, division_relevance: 'marine', is_breaking: true, discovered_at: daysAgo(1), status: 'active' },
  { keyword: 'solar inverter price Nigeria', topic: 'Diesel vs solar debate', description: 'As diesel crosses ₦1,200/litre, households and businesses are costing solar alternatives. Savings-calculator content will convert.', source: 'Reddit', momentum_score: 76, division_relevance: 'tech', is_breaking: false, discovered_at: daysAgo(2), status: 'active' },
  { keyword: 'NIMASA safety compliance 2026', topic: 'Fleet operators face audits', description: 'NIMASA enforcement push means commercial operators must show safety certificates. Compliance-package outreach angle.', source: 'News API', momentum_score: 69, division_relevance: 'marine', is_breaking: false, discovered_at: daysAgo(2), status: 'active' },
  { keyword: 'car tracker Lagos theft', topic: 'Vehicle theft stories trending', description: 'Viral car-theft stories driving tracker inquiries nationwide. Testimonial-style ads will perform well.', source: 'Twitter/X', momentum_score: 71, division_relevance: 'tech', is_breaking: false, discovered_at: daysAgo(3), status: 'active' },
  { keyword: 'fiberglass boat repair PH', topic: 'Local repair demand', description: 'Boat owners searching for fiberglass repair in Port Harcourt instead of towing to Lagos. Before/after content opportunity.', source: 'Google Trends', momentum_score: 63, division_relevance: 'marine', is_breaking: false, discovered_at: daysAgo(4), status: 'active' },
]

const COMPETITORS = [
  { name: 'PH Marine World', website: 'https://phmarineworld.example.com', facebook_url: 'https://facebook.com/phmarineworld', instagram_url: 'https://instagram.com/phmarineworld', division: 'marine', last_scanned: daysAgo(1), intel_report: { content_gaps: ['No price transparency posts', 'No installation videos', 'Ignores safety-compliance angle'], audience_gaps: ['NDDC contractors', 'Fishing cooperatives'], offer_gaps: ['No maintenance contracts', 'No spare-parts subscription'], weaknesses: [{ weakness: 'Never shows prices', competitor_doing_it: 'Hides all pricing behind DMs', recommended_fix: 'Publish transparent price posts weekly', priority: 'high' }], immediate_actions: ['Post Suzuki DF140 price this week', 'Film warehouse walkthrough'] }, active_ads: [{ ad_type: 'image', creative_description: 'Yamaha engine on a stand, price hidden', copy_angle: 'aspiration', cta: 'Send Message', estimated_run_days: 21, what_we_can_steal: 'Engine close-up creative works — ours should add the price' }], posting_patterns: { posts_per_week: 3, best_days: ['Wed', 'Sat'], top_format: 'image' }, created_at: daysAgo(9) },
  { name: 'SecureHome NG', website: 'https://securehomeng.example.com', facebook_url: 'https://facebook.com/securehomeng', instagram_url: 'https://instagram.com/securehomeng', division: 'tech', last_scanned: daysAgo(2), intel_report: { content_gaps: ['No estate case studies', 'No before/after install footage'], audience_gaps: ['Churches and schools', 'Short-let hosts'], offer_gaps: ['No solar+CCTV bundle', 'No maintenance plans'], weaknesses: [{ weakness: 'Slow DM response (2+ days)', competitor_doing_it: 'Replies after 48 hours', recommended_fix: 'Advertise our instant WhatsApp response', priority: 'critical' }], immediate_actions: ['Launch CCTV+solar bundle post', 'Publish GRA estate case study'] }, active_ads: [{ ad_type: 'video', creative_description: 'Night footage demo from a bullet camera', copy_angle: 'fear', cta: 'Learn More', estimated_run_days: 34, what_we_can_steal: 'Night-vision demo angle converts — film ours at Rumuola' }], posting_patterns: { posts_per_week: 5, best_days: ['Mon', 'Fri'], top_format: 'video' }, created_at: daysAgo(9) },
  { name: 'Delta Solar Solutions', website: 'https://deltasolar.example.com', facebook_url: '', instagram_url: 'https://instagram.com/deltasolar', division: 'tech', last_scanned: daysAgo(4), intel_report: { content_gaps: ['No diesel-vs-solar maths content', 'No customer video testimonials'], audience_gaps: ['Churches', 'Hotels'], offer_gaps: ['No pay-small-small plan'], weaknesses: [{ weakness: 'Lagos-based, slow PH response', competitor_doing_it: 'Installs take 2+ weeks in PH', recommended_fix: 'Push our same-week PH installation', priority: 'high' }], immediate_actions: ['Post diesel-vs-solar calculator', 'Collect 3 video testimonials'] }, active_ads: [], posting_patterns: { posts_per_week: 2, best_days: ['Tue'], top_format: 'carousel' }, created_at: daysAgo(9) },
]

const SOCIAL_POSTS = [
  { division: 'marine', post_type: 'Product Spotlight', platform: 'instagram', caption: 'Genuine Suzuki DF140A — 140HP of pure reliability for your crew boats. In stock NOW in Port Harcourt, no Lagos trip needed. 2-year warranty + installation included. DM us or WhatsApp 08109522432!', hashtags: ['PortHarcourt', 'SuzukiMarine', 'OutboardEngine', 'NigerDelta'], cta: 'WhatsApp 08109522432 to order', status: 'published', published_at: daysAgo(2), engagement: { likes: 214, comments: 31, shares: 12 }, auto_generated: true, created_at: daysAgo(3) },
  { division: 'tech', post_type: 'Problem-Solution', platform: 'facebook', caption: 'PHCN don show you pepper again? Our 3.5KVA solar system keeps your AC, freezer and pumps running 24/7. From ₦4,850,000 with 2-year warranty. Send us a DM for a FREE load assessment!', hashtags: ['SolarNigeria', 'PortHarcourt', 'NoMorePHCN'], cta: 'Comment SOLAR for a free quote', status: 'published', published_at: daysAgo(1), engagement: { likes: 342, comments: 58, shares: 44 }, auto_generated: true, created_at: daysAgo(2) },
  { division: 'tech', post_type: 'Security Awareness', platform: 'whatsapp', caption: 'After the recent break-ins around Rumuola, one question: is your home watching when you are not there? 8-camera Hikvision kit + same-day installation — ₦950,000 only this week.', hashtags: ['HomeSecurity', 'CCTV'], cta: 'Reply INSTALL on WhatsApp', status: 'scheduled', scheduled_at: new Date(Date.now() + 2 * 86400000).toISOString(), engagement: {}, auto_generated: true, created_at: daysAgo(0) },
  { division: 'marine', post_type: 'Educational', platform: 'linkedin', caption: '5 signs your outboard engine needs servicing before it strands you mid-river: hard starting, overheating alarm, reduced top speed, excessive smoke, gear-shift delays. Our certified technicians service Suzuki & Yamaha in PH. B2B maintenance contracts available.', hashtags: ['MarineSafety', 'OilAndGas', 'NigerDelta'], cta: 'Email info@roshanalinfotech.com for contracts', status: 'draft', engagement: {}, auto_generated: true, created_at: daysAgo(1) },
  { division: 'tech', post_type: 'Testimonial', platform: 'instagram', caption: '"They installed 8 cameras in our GRA duplex in ONE day. I watch my gate from London now!" — Mrs. Okafor, GRA Phase 2. Your home could be next. Tap the link to book a free site survey.', hashtags: ['CustomerReview', 'Hikvision', 'GRA'], cta: 'Tap link in bio to book', status: 'draft', engagement: {}, auto_generated: true, created_at: daysAgo(0) },
  { division: 'marine', post_type: 'Urgency', platform: 'facebook', caption: 'LAST 3 UNITS! Yamaha F100XB engines at ₦14,200,000 — when they finish, next shipment is 8 weeks away. First come, first served at 18A Rumuola Road, PH.', hashtags: ['Yamaha', 'OutboardEngine', 'LimitedStock'], cta: 'Call 08033170802 now', status: 'draft', engagement: {}, auto_generated: true, created_at: daysAgo(0) },
]

const UGC_ADS = [
  { division: 'marine', ad_type: 'Testimonial', platform: 'facebook', headline: 'My crew boat has NEVER run better', primary_text: 'We switched our 3 crew boats to Suzuki DF140 from Roshanal and fuel costs dropped 30%. Real engines, real warranty, Port Harcourt pickup. Highly recommended for any marine operator.', cta_button: 'Send Message', video_script: '[0-3s HOOK] Show fuel receipts pile. "We were burning money every week." [3-10s] Engine close-ups on the water. [10-15s CTA] Showroom address + phone.', status: 'approved', used_in_campaign: false, created_at: daysAgo(5) },
  { division: 'tech', ad_type: 'Problem-Solution', platform: 'instagram', headline: 'POV: NEPA takes light during your party', primary_text: 'Not in my house! Our solar keeps the music, freezer and AC on ALL night. Roshanal installed in 2 days. Ask me how.', cta_button: 'Learn More', video_script: '[0-3s] Dark house, generator noise. [3-8s] Switch to bright solar-powered home. [8-15s] Happy family + CTA to WhatsApp.', status: 'draft', used_in_campaign: false, created_at: daysAgo(3) },
  { division: 'tech', ad_type: 'Unboxing', platform: 'tiktok', headline: 'Unboxing my smart lock', primary_text: 'Watch me ditch my keys forever — fingerprint, PIN and phone app. Installed by Roshanal in 45 minutes!', cta_button: 'Shop Now', video_script: '[0-3s] Box opening. [3-10s] Install montage. [10-15s] Finger unlock demo + price.', status: 'draft', used_in_campaign: false, created_at: daysAgo(2) },
  { division: 'marine', ad_type: 'Before-After', platform: 'facebook', headline: 'From leaking hull to like-new in 6 days', primary_text: 'Our patrol boat was taking in water. Roshanal fiberglass team rebuilt the hull — see the transformation. If your boat needs surgery, these are your people.', cta_button: 'Call Now', video_script: '[0-4s] Damaged hull shots. [4-10s] Repair timelapse. [10-15s] Sea trial + CTA.', status: 'approved', used_in_campaign: true, created_at: daysAgo(7) },
]

const SOCIAL_ACCOUNTS = [
  { platform: 'facebook', account_name: 'Roshanal Infotech', account_id: 'fb_demo_001', access_token: 'demo-not-connected', is_connected: false, post_count_today: 0, created_at: daysAgo(9) },
  { platform: 'instagram', account_name: '@roshanalinfotech', account_id: 'ig_demo_001', access_token: 'demo-not-connected', is_connected: false, post_count_today: 0, created_at: daysAgo(9) },
  { platform: 'whatsapp', account_name: 'Roshanal Business', account_id: 'wa_demo_001', access_token: 'demo-not-connected', is_connected: true, last_post: daysAgo(0), post_count_today: 3, created_at: daysAgo(9) },
  { platform: 'linkedin', account_name: 'Roshanal Infotech Limited', account_id: 'li_demo_001', access_token: 'demo-not-connected', is_connected: false, post_count_today: 0, created_at: daysAgo(9) },
  { platform: 'twitter', account_name: '@roshanalinfotech', account_id: 'tw_demo_001', access_token: 'demo-not-connected', is_connected: false, post_count_today: 0, created_at: daysAgo(9) },
]

const EMAIL_TEMPLATES = [
  { name: 'Marine Promo Blast', division: 'both', type: 'promo', subject_options: ['Genuine Suzuki & Yamaha engines in stock — PH pickup', 'Skip Lagos: marine equipment now in Port Harcourt'], content: 'Hello {{first_name}}, this is {{company}} here — Roshanal Infotech, Port Harcourt. {{product_interest}} is in stock with warranty and installation. Reply to this email or WhatsApp 08109522432 for today\'s price.', variables: ['first_name', 'company', 'product_interest'], is_active: true, usage_count: 12, created_at: daysAgo(20) },
  { name: 'Quote Follow-up (Day 3)', division: 'both', type: 'follow_up', subject_options: ['Still thinking about it, {{first_name}}?', 'Your quote expires Friday'], content: 'Hi {{first_name}}, just checking in on the quote we sent for {{product_interest}}. Stock moves fast this season — shall I reserve a unit for you? Reply YES and I will hold it till Friday.', variables: ['first_name', 'product_interest'], is_active: true, usage_count: 34, created_at: daysAgo(20) },
  { name: 'Solar Savings Newsletter', division: 'tech', type: 'newsletter', subject_options: ['Diesel @ ₦1,200/litre? Do this maths', '3 homes in GRA went solar last week'], content: 'Hello {{first_name}}, with diesel prices where they are, a 3.5KVA solar system now pays for itself in under 18 months. See how 3 GRA families did it + this month\'s 10% installation discount.', variables: ['first_name'], is_active: true, usage_count: 8, created_at: daysAgo(15) },
  { name: 'Safety Compliance Reminder', division: 'marine', type: 'follow_up', subject_options: ['Is your fleet audit-ready?', 'NIMASA checklist inside'], content: 'Hello {{first_name}}, NIMASA enforcement is tightening. Confirm your life jackets, ring buoys and extinguishers are certified — we stock everything in PH with same-week delivery to your jetty.', variables: ['first_name'], is_active: true, usage_count: 5, created_at: daysAgo(15) },
]

const AUTOMATION_TRIGGERS = [
  { name: 'New WhatsApp lead → instant reply', trigger_expression: 'whatsapp_inbound:new_message', actions_json: [{ action: 'send_template', template: 'greeting' }, { action: 'create_lead', stage: 'new_lead' }, { action: 'notify_owner' }], is_active: true, fired_count: 214, last_fired: daysAgo(0), created_at: daysAgo(30) },
  { name: 'Quote sent → 48h follow-up', trigger_expression: 'crm:stage_changed:proposal_sent', actions_json: [{ action: 'wait_hours', hours: 48 }, { action: 'send_whatsapp', template: 'quote_followup' }], is_active: true, fired_count: 96, last_fired: daysAgo(1), created_at: daysAgo(30) },
  { name: 'Hot lead idle 7 days → re-engage', trigger_expression: 'crm:hot_idle_7d', actions_json: [{ action: 'send_email', template: 'we_miss_you' }, { action: 'task_owner', task: 'call_lead' }], is_active: false, fired_count: 31, last_fired: daysAgo(9), created_at: daysAgo(30) },
]

const REVIEWS = [
  { platform: 'google', rating: 5, review_text: 'Genuine Yamaha outboard engine with fast delivery to our jetty in Bonny. Best marine supplier in Port Harcourt.', requested_at: daysAgo(12), submitted_at: daysAgo(9), published_to_social: true, created_at: daysAgo(9) },
  { platform: 'google', rating: 5, review_text: 'They installed 8 Hikvision cameras in our estate duplex at GRA. Very professional team, same-day installation.', requested_at: daysAgo(10), submitted_at: daysAgo(8), published_to_social: true, created_at: daysAgo(8) },
  { platform: 'facebook', rating: 4, review_text: 'Good fiberglass repair work on our patrol boat. Will use them again for fleet maintenance.', requested_at: daysAgo(8), submitted_at: daysAgo(6), published_to_social: false, created_at: daysAgo(6) },
  { platform: 'google', rating: 5, review_text: 'Solar system has carried my whole duplex for 3 months without PHCN. Excellent after-sales support.', requested_at: daysAgo(6), submitted_at: daysAgo(4), published_to_social: false, created_at: daysAgo(4) },
]

async function wipe(reseed: boolean) {
  if (!reseed) return
  const order = ['referrals', 'reviews', 'social_posts', 'ugc_ads', 'campaign_events', 'campaign_sequences', 'campaigns', 'crm_activities', 'call_logs', 'leads', 'product_sources', 'products', 'trends', 'competitors', 'social_accounts', 'email_templates', 'automation_triggers', 'audit_logs', 'analytics_daily']
  for (const t of order) {
    const { error } = await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) console.log(`wipe ${t}: ${error.message}`)
  }
}

async function main() {
  const reseed = process.argv.includes('--reseed')
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  if ((productCount || 0) > 0 && !reseed) {
    console.log('Demo content already seeded. Run with --reseed to replace it.')
    return
  }
  await wipe(reseed)

  const { data: products, error: pErr } = await supabase.from('products').insert(PRODUCTS.map(p => ({ id: uid(), ...p, created_at: daysAgo(30), updated_at: daysAgo(2) }))).select('id,name')
  if (pErr) throw new Error('products: ' + pErr.message)
  console.log(`products: ${products.length}`)
  const productByName = Object.fromEntries(products.map(p => [p.name, p.id]))

  const { data: leads, error: lErr } = await supabase.from('leads').insert(LEADS.map((l, i) => ({ id: uid(), ...l, created_at: daysAgo(20 - i) }))).select('id,full_name')
  if (lErr) throw new Error('leads: ' + lErr.message)
  console.log(`leads: ${leads.length}`)
  const leadByName = Object.fromEntries(leads.map(l => [l.full_name, l.id]))

  const { error: cErr } = await supabase.from('campaigns').insert(CAMPAIGNS.map(c => ({ id: uid(), ...c })))
  if (cErr) throw new Error('campaigns: ' + cErr.message)
  console.log(`campaigns: ${CAMPAIGNS.length}`)

  const { error: tErr } = await supabase.from('trends').insert(TRENDS.map(t => ({ id: uid(), ...t })))
  if (tErr) throw new Error('trends: ' + tErr.message)
  console.log(`trends: ${TRENDS.length}`)

  const { error: coErr } = await supabase.from('competitors').insert(COMPETITORS.map(c => ({ id: uid(), ...c })))
  if (coErr) throw new Error('competitors: ' + coErr.message)
  console.log(`competitors: ${COMPETITORS.length}`)

  const postsWithIds = SOCIAL_POSTS.map(s => {
    const pid = s.caption.includes('Suzuki DF140A') ? productByName['Suzuki DF140A Outboard Engine'] : s.caption.includes('GRA duplex') || s.caption.includes('8-camera') ? productByName['Complete 8-Channel Home CCTV Kit'] : s.caption.includes('Yamaha F100XB') ? productByName['Yamaha F100XB Outboard Engine'] : null
    return { id: uid(), ...s, product_id: pid }
  })
  const { error: sErr } = await supabase.from('social_posts').insert(postsWithIds)
  if (sErr) throw new Error('social_posts: ' + sErr.message)
  console.log(`social_posts: ${postsWithIds.length}`)

  const { error: uErr } = await supabase.from('ugc_ads').insert(UGC_ADS.map(u => ({ id: uid(), ...u })))
  if (uErr) throw new Error('ugc_ads: ' + uErr.message)
  console.log(`ugc_ads: ${UGC_ADS.length}`)

  const { error: aErr } = await supabase.from('social_accounts').insert(SOCIAL_ACCOUNTS.map(a => ({ id: uid(), ...a })))
  if (aErr) throw new Error('social_accounts: ' + aErr.message)
  console.log(`social_accounts: ${SOCIAL_ACCOUNTS.length}`)

  const { error: eErr } = await supabase.from('email_templates').insert(EMAIL_TEMPLATES.map(e => ({ id: uid(), ...e })))
  if (eErr) throw new Error('email_templates: ' + eErr.message)
  console.log(`email_templates: ${EMAIL_TEMPLATES.length}`)

  const { error: auErr } = await supabase.from('automation_triggers').insert(AUTOMATION_TRIGGERS.map(a => ({ id: uid(), ...a })))
  if (auErr) throw new Error('automation_triggers: ' + auErr.message)
  console.log(`automation_triggers: ${AUTOMATION_TRIGGERS.length}`)

  const reviewsWithLeads = REVIEWS.map((r, i) => ({ id: uid(), ...r, lead_id: leads[i % leads.length].id }))
  const { error: rErr } = await supabase.from('reviews').insert(reviewsWithLeads)
  if (rErr) throw new Error('reviews: ' + rErr.message)
  console.log(`reviews: ${reviewsWithLeads.length}`)

  const { error: refErr } = await supabase.from('referrals').insert([
    { id: uid(), referrer_lead_id: leadByName['Pastor F. Amadi'], referred_lead_id: leadByName['Adaeze Okafor'], referral_code: 'ROSH-FRIEND-2026', status: 'paid', reward_ngn: 25000, paid_at: daysAgo(6), created_at: daysAgo(12) },
    { id: uid(), referrer_lead_id: leadByName['Pastor F. Amadi'], referred_lead_id: leadByName['Fatima Bello'], referral_code: 'ROSH-FRIEND-2026', status: 'customer', reward_ngn: 25000, created_at: daysAgo(8) },
    { id: uid(), referrer_lead_id: leadByName['Capt. Ebiware Johnson'], referred_lead_id: leadByName['Samuel Etim'], referral_code: 'ROSH-FRIEND-2026', status: 'qualified', reward_ngn: 0, created_at: daysAgo(3) },
  ])
  if (refErr) throw new Error('referrals: ' + refErr.message)
  console.log('referrals: 3')

  const { error: alErr } = await supabase.from('audit_logs').insert([
    { id: uid(), user_id: 'demo', action: 'login', entity_type: 'session', entity_id: 'demo', details: { method: 'password' }, created_at: daysAgo(0) },
    { id: uid(), user_id: 'demo', action: 'campaign.send', entity_type: 'campaign', entity_id: 'demo', details: { name: 'Suzuki Engine Promo Q3', sent: 2340 }, created_at: daysAgo(3) },
    { id: uid(), user_id: 'demo', action: 'lead.qualify', entity_type: 'lead', entity_id: 'demo', details: { name: 'First Bank (PH Branch)', grade: 'A' }, created_at: daysAgo(2) },
    { id: uid(), user_id: 'demo', action: 'post.publish', entity_type: 'social_post', entity_id: 'demo', details: { platform: 'facebook' }, created_at: daysAgo(1) },
    { id: uid(), user_id: 'demo', action: 'product.create', entity_type: 'product', entity_id: 'demo', details: { name: 'LivFast 3.5KVA Solar Inverter System' }, created_at: daysAgo(5) },
  ])
  if (alErr) throw new Error('audit_logs: ' + alErr.message)
  console.log('audit_logs: 5')

  const { error: anErr } = await supabase.from('analytics_daily').insert(
    [6, 5, 4, 3, 2, 1, 0].map(n => ({
      id: uid(),
      date: new Date(Date.now() - n * 86400000).toISOString().slice(0, 10),
      posts_published: 1 + (n % 3),
      total_reach: 1800 + n * 240,
      total_engagement: 220 + n * 31,
      leads_generated: 2 + (n % 4),
      campaigns_sent: n % 2,
      ai_cost_usd: 1.2,
      platform_breakdown: { instagram: 40, facebook: 30, whatsapp: 20, linkedin: 10 },
      top_posts: [],
    }))
  )
  if (anErr) throw new Error('analytics_daily: ' + anErr.message)
  console.log('analytics_daily: 7')

  console.log('Demo content seeded successfully!')
}

main().catch((e) => {
  console.error('Seed failed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
