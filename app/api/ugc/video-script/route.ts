import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

const VIDEO_SCRIPTS = {
  testimonial: {
    structure: [
      { section: 'Hook', duration: '0-3s', content: 'Start with a problem your customer faced' },
      { section: 'Introduction', duration: '3-10s', content: 'Introduce yourself and your situation' },
      { section: 'Problem', duration: '10-20s', content: 'Describe the pain point in detail' },
      { section: 'Solution', duration: '20-35s', content: 'Introduce Roshanal product as the solution' },
      { section: 'Results', duration: '35-50s', content: 'Show the transformation/results' },
      { section: 'CTA', duration: '50-60s', content: 'Direct viewers to contact Roshanal' }
    ]
  },
  unboxing: {
    structure: [
      { section: 'Excitement Hook', duration: '0-5s', content: 'Show the package with excitement' },
      { section: 'First Look', duration: '5-15s', content: 'Open the box, reveal the product' },
      { section: 'Features Walkthrough', duration: '15-35s', content: 'Highlight key features' },
      { section: 'Close-up Details', duration: '35-45s', content: 'Zoom in on quality details' },
      { section: 'First Impression', duration: '45-55s', content: 'Share honest first thoughts' },
      { section: 'CTA', duration: '55-60s', content: 'Tell viewers where to buy' }
    ]
  },
  problem_solution: {
    structure: [
      { section: 'Problem Hook', duration: '0-5s', content: 'Show the painful problem visually' },
      { section: 'Agitation', duration: '5-15s', content: 'Make them feel the pain - statistics, costs' },
      { section: 'Failed Attempts', duration: '15-25s', content: 'Show what others tried that failed' },
      { section: 'Solution Reveal', duration: '25-40s', content: 'Introduce Roshanal product' },
      { section: 'Proof', duration: '40-50s', content: 'Show it working/results' },
      { section: 'CTA', duration: '50-60s', content: 'Contact info + urgency' }
    ]
  },
  installation: {
    structure: [
      { section: 'Before State', duration: '0-10s', content: 'Show the situation before installation' },
      { section: 'Setup Process', duration: '10-30s', content: 'Time-lapse of professional installation' },
      { section: 'Key Steps', duration: '30-40s', content: 'Highlight professional techniques' },
      { section: 'After State', duration: '40-50s', content: 'Show the finished, working system' },
      { section: 'Customer Reaction', duration: '50-55s', content: 'Customer satisfaction moment' },
      { section: 'CTA', duration: '55-60s', content: 'Book your installation' }
    ]
  }
}

const ROSHANAL_CONTACT = {
  phones: '08109522432 | 08033170802 | 08180388018',
  whatsapp: 'https://wa.me/2348109522432',
  address: 'No 18A Rumuola/Rumuadaolu Road, Port Harcourt'
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { script_type = 'problem_solution', division, product_name, post_id } = body

    if (!division) {
      return NextResponse.json({ error: 'Division is required' }, { status: 400 })
    }

    const scriptTemplate = VIDEO_SCRIPTS[script_type as keyof typeof VIDEO_SCRIPTS] || VIDEO_SCRIPTS.problem_solution

    const script = generateFullScript(scriptTemplate, division, product_name || '', script_type)

    const savedScript = {
      id: `ugc_${Date.now()}`,
      division,
      product_name,
      script_type,
      post_id,
      script,
      created_at: new Date().toISOString()
    }

    if (post_id) {
      await db
        .from('social_posts')
        .update({ video_script: JSON.stringify(script) })
        .eq('id', post_id)
    }

    return NextResponse.json({ success: true, script: savedScript })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function generateFullScript(template: any, division: string, product: string, type: string) {
  const marineExample = {
    product: 'Suzuki 100HP Outboard Engine',
    customer: 'Chief Emeka, boat operator in Bonny River',
    problem: 'Engine breakdown in middle of river, stranded for hours, lost ₦200k in delayed cargo',
    solution: 'Roshanal provided genuine Suzuki engine with warranty and professional installation',
    result: 'Zero breakdowns in 2 years, reliable service, peace of mind'
  }

  const techExample = {
    product: 'Hikvision 4-Camera CCTV System + Solar Backup',
    customer: 'Mr. Adebayo, homeowner in GRA Port Harcourt',
    problem: 'Armed robbery in neighborhood, PHCN out 3 days, couldn\'t monitor property',
    solution: 'Roshanal installed 4 Hikvision cameras with solar battery backup',
    result: '24/7 surveillance even during power outages, remote viewing on phone'
  }

  const example = division === 'marine' ? marineExample : techExample

  return {
    title: `${division === 'marine' ? 'Marine Equipment' : 'Security & Solar'} UGC Video Script`,
    type,
    product: product || example.product,
    duration: '60 seconds',
    sections: template.structure.map((section: any) => ({
      ...section,
      dialogue: generateDialogue(section, example, division),
      visuals: generateVisuals(section, example, division),
      text_overlay: generateTextOverlay(section, example, division)
    })),
    shooting_tips: [
      'Use natural lighting - morning or golden hour works best',
      'Keep camera steady - use a tripod or gimbal',
      'Speak clearly and naturally, not scripted',
      'Show the product in real environment',
      'Include Roshanal contact info at end',
      'Add subtitles for accessibility'
    ],
    contact_overlay: `📞 ${ROSHANAL_CONTACT.phones}\n📍 ${ROSHANAL_CONTACT.address}\n💬 WhatsApp: ${ROSHANAL_CONTACT.whatsapp}`
  }
}

function generateDialogue(section: any, example: any, division: string): string {
  const dialogues: Record<string, string> = {
    'Hook': `Have you ever dealt with ${example.problem.split(',')[0]}? I know I have, and it's frustrating.`,
    'Excitement Hook': `This just arrived from Roshanal Infotech! Let's unbox it together.`,
    'Problem Hook': `${example.problem}? Yeah, that happened to me.`,
    'Before State': `This is what my setup looked like before Roshanal came through.`,
    'Introduction': `I'm [name], and I run ${division === 'marine' ? 'a boat operation' : 'a business'} in Port Harcourt.`,
    'First Look': `Look at this build quality! This is a ${example.product}.`,
    'Agitation': `Every day without proper ${division === 'marine' ? 'marine equipment' : 'security'} is a risk.`,
    'Setup Process': `Watch how professional their installation team is.`,
    'Problem': `${example.problem}. It cost me time, money, and peace of mind.`,
    'Features Walkthrough': `Here are the features that make this worth it: ${division === 'marine' ? 'Fuel efficiency, reliability, genuine parts availability' : 'HD recording, night vision, mobile app, solar backup'}.`,
    'Key Steps': `They handle everything professionally — no cutting corners.`,
    'Failed Attempts': `I tried cheaper options first. They failed within months.`,
    'Close-up Details': `Look at these details. This is genuine quality from ${division === 'marine' ? 'Suzuki/Yamaha' : 'Hikvision'}.`,
    'Solution Reveal': `Then I found Roshanal Infotech right here in Port Harcourt.`,
    'After State': `And now? Everything works perfectly. ${division === 'marine' ? 'My boat runs smooth every day' : 'I can monitor my property from anywhere'}.`,
    'Solution': `They installed ${example.product}. The difference? Night and day.`,
    'Customer Reaction': `I should have done this from the start.`,
    'Results': `${example.result}. Best investment I've made.`,
    'First Impression': `Honestly, I'm impressed. This exceeds what I expected for the price.`,
    'CTA': `If you're in Port Harcourt and need this, contact Roshanal Infotech. ${example.phones}. They're legit. Call ${example.phones.split('|')[0].trim()}. Don't wait until it's too late.`,
  }

  return dialogues[section.section] || 'Share your experience here'
}

function generateVisuals(section: any, example: any, division: string): string {
  const visuals: Record<string, string> = {
    'Hook': 'Show frustrated person or broken equipment',
    'Excitement Hook': 'Close-up of sealed package with Roshanal branding',
    'Problem Hook': 'Dramatic visual of the problem (dark house, broken boat)',
    'Before State': 'Wide shot of current setup/problem area',
    'Introduction': 'Person speaking directly to camera, real environment',
    'First Look': 'Hands opening package, reveal product',
    'Agitation': 'Statistics overlay, news clippings about security/power issues',
    'Setup Process': 'Time-lapse or sped-up installation footage',
    'Problem': 'Reenactment or real footage of the problem',
    'Features Walkthrough': 'Close-up pan of product features, pointing to each',
    'Key Steps': 'Professional workers in Roshanal uniforms installing',
    'Failed Attempts': 'Show broken/cheap alternative products',
    'Close-up Details': 'Macro shots of product details, logos, quality marks',
    'Solution Reveal': 'Product reveal with dramatic lighting',
    'After State': 'Clean, working setup in the same location as before',
    'Customer Reaction': 'Genuine smile, thumbs up, or satisfied expression',
    'Solution': 'Before/after split screen',
    'First Impression': 'Honest reaction shot, product in hand',
    'Results': 'Charts, graphs, or real-life demonstration of results',
    'CTA': 'Roshanal storefront, contact info on screen, product shot'
  }

  return visuals[section.section] || 'Relevant visual'
}

function generateTextOverlay(section: any, example: any, division: string): string {
  const overlays: Record<string, string> = {
    'Hook': 'This will change how you think about marine equipment',
    'Excitement Hook': 'UNBOXING: Brand new from Roshanal! 📦',
    'Problem Hook': 'This is why you need proper security NOW',
    'Before State': 'BEFORE: No protection at all',
    'Introduction': 'Real customer, real results',
    'First Look': 'First impressions 👀',
    'Agitation': `Are you at risk? 78% of PH homes lack proper security`,
    'Setup Process': 'Professional installation in progress ⏱️',
    'Problem': `Cost of ignoring this: ₦${division === 'marine' ? '500,000' : '2,000,000'}+ yearly`,
    'Features Walkthrough': 'Why this is worth every Naira',
    'Key Steps': 'Certified technicians only ✅',
    'Failed Attempts': 'Cheap alternatives DON\'T work ❌',
    'Close-up Details': 'Genuine quality matters',
    'Solution Reveal': 'The solution? Roshanal Infotech',
    'After State': 'AFTER: Complete peace of mind',
    'Customer Reaction': 'Worth every Kobo! 💯',
    'Solution': 'Game changer for Port Harcourt',
    'First Impression': 'Better than expected! ⭐⭐⭐⭐⭐',
    'Results': 'Results speak for themselves',
    'CTA': `📞 Call: ${example.phones.split('|')[0].trim()}`
  }

  return overlays[section.section] || 'Relevant text overlay'
}
