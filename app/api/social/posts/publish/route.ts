import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'
import { getApiKey } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const { post_id, platform } = await request.json()
    
    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }
    
    const { data: post, error: postError } = await insforgeAdmin
      .database
      .from('social_posts')
      .select('*')
      .eq('id', post_id)
      .single()
    
    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    const platformToUse = platform || post.platform
    let publishResult: any = { status: 'simulated', message: 'Post would be published' }
    
    if (platformToUse === 'facebook' || platformToUse === 'instagram') {
      const metaKey = await getApiKey('meta', 'Production Key')
      if (metaKey) {
        publishResult = { status: 'ready', message: 'Meta API configured - would publish' }
      }
    } else if (platformToUse === 'whatsapp') {
      const metaKey = await getApiKey('meta', 'Production Key')
      if (metaKey) {
        publishResult = { status: 'ready', message: 'WhatsApp API configured - would send' }
      }
    }
    
    const { error: updateError } = await insforgeAdmin
      .database
      .from('social_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        platform_post_id: `sim_${Date.now()}`
      })
      .eq('id', post_id)
    
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    
    return NextResponse.json({ 
      message: 'Post published (simulated)', 
      post_id,
      platform: platformToUse,
      result: publishResult
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
