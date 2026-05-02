import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

const OPTIMAL_POSTING_TIMES = {
  instagram: ['07:00', '12:00', '20:00'],
  facebook: ['08:00', '13:00', '19:00'],
  linkedin: ['08:00', '12:00'],
  twitter: ['09:00', '14:00', '21:00'],
  whatsapp: ['07:00', '19:00']
}

async function publishToFacebook(post: any, accountId: string, accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: post.caption,
        access_token: accessToken
      })
    }
  )
  return response.json()
}

async function publishToInstagram(post: any, accountId: string, accessToken: string) {
  let mediaId: string

  const createMedia = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: post.image_url || 'https://via.placeholder.com/1080x1080',
        caption: post.caption,
        access_token: accessToken
      })
    }
  )

  const mediaData = await createMedia.json()
  mediaId = mediaData.id

  await new Promise(resolve => setTimeout(resolve, 5000))

  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: mediaId,
        access_token: accessToken
      })
    }
  )

  return publishResponse.json()
}

async function publishToTwitter(post: any, credentials: any) {
  return { success: false, error: 'Twitter API v2 requires OAuth 1.0a user context' }
}

async function publishToLinkedIn(post: any, credentials: any) {
  return { success: false, error: 'LinkedIn API requires organization ID and OAuth token' }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { post_id, platform, immediate = false } = body

    if (!post_id || !platform) {
      return NextResponse.json({ error: 'post_id and platform are required' }, { status: 400 })
    }

    const { data: post, error: postError } = await db
      .from('social_posts')
      .select('*')
      .eq('id', post_id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { data: socialAccount } = await db
      .from('social_accounts')
      .select('*')
      .eq('platform', platform)
      .eq('is_connected', true)
      .single()

    if (!socialAccount) {
      return NextResponse.json({ 
        error: `${platform} account not connected`,
        action: 'connect_account',
        post_id
      }, { status: 400 })
    }

    const accountData = socialAccount as any
    const postData = post as any

    let publishResult: any

    switch (platform) {
      case 'facebook':
        publishResult = await publishToFacebook(postData, accountData.account_id, accountData.access_token)
        break
      case 'instagram':
        publishResult = await publishToInstagram(postData, accountData.account_id, accountData.access_token)
        break
      case 'twitter':
        publishResult = await publishToTwitter(postData, accountData)
        break
      case 'linkedin':
        publishResult = await publishToLinkedIn(postData, accountData)
        break
      default:
        return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
    }

    const now = new Date().toISOString()

    await db
      .from('social_posts')
      .update({
        status: publishResult?.error ? 'failed' : 'published',
        published_at: now,
        platform_post_id: publishResult?.id || null,
        engagement: JSON.stringify({ published_at: now, platform })
      })
      .eq('id', post_id)

    return NextResponse.json({
      success: !publishResult?.error,
      platform,
      post_id,
      platform_post_id: publishResult?.id,
      error: publishResult?.error
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
