import { Worker, Job } from 'bullmq'
import { QueueName, createQueue, createWorker, getQueueStatus } from '@/lib/queue'
import { DBClient } from '@/lib/insforge/server'
import { generateContent } from '@/lib/ai/claude'
import { getAllTrends } from '@/lib/trends/aggregator'
import { scrapeCompetitor, scrapeAllCompetitors } from '@/lib/competitor/analysis'
import { publishToFacebook, publishToInstagram } from '@/lib/social/publishers'
import { sendEmail } from '@/lib/email/sendgrid'
import { sendSMS } from '@/lib/twilio/sms'
import { emitToUser, emitToAdmin, WS_EVENTS } from '@/lib/websocket'

const db = new DBClient()

const contentQueue = createQueue(QueueName.CONTENT_GENERATION)
const socialQueue = createQueue(QueueName.SOCIAL_PUBLISHING)
const campaignQueue = createQueue(QueueName.CAMPAIGN_SENDING)
const competitorQueue = createQueue(QueueName.COMPETITOR_SCRAPING)
const leadQueue = createQueue(QueueName.LEAD_SCRAPING)
const imageQueue = createQueue(QueueName.IMAGE_GENERATION)
const emailQueue = createQueue(QueueName.EMAIL_SENDING)
const smsQueue = createQueue(QueueName.SMS_SENDING)

async function processContentGeneration(job: Job): Promise<void> {
  const { postId, userId, division, platform, postType } = job.data
  
  emitToUser(userId, WS_EVENTS['content:generating'], { job_id: job.id })
  
  const { data: product } = await db.from('products').select('*').limit(1)
  const { data: trends } = await db.from('trends').select('*').eq('status', 'active').limit(5)
  
  const content = await generateContent({
    businessProfile: 'Roshanal Infotech Limited',
    productCatalog: product ? JSON.stringify(product) : '',
    trends: trends ? JSON.stringify(trends) : '',
    contentType: postType,
    division,
    platform
  })
  
  await db.from('social_posts').update({
    caption: content.content,
    status: 'draft',
    auto_generated: true
  }).eq('id', postId)
  
  emitToUser(userId, WS_EVENTS['content:ready'], { job_id: job.id })
}

async function processSocialPublishing(job: Job): Promise<void> {
  const { postId, platform, userId } = job.data
  
  emitToUser(userId, WS_EVENTS['post:publishing'], { post_id: postId, platform })
  
  const { data: post } = await db.from('social_posts').select('*').eq('id', postId).single()
  const { data: account } = await db.from('social_accounts').select('*').eq('platform', platform).single()
  
  if (!post || !account) {
    emitToUser(userId, WS_EVENTS['post:failed'], { post_id: postId, platform, error: 'Post or account not found' })
    return
  }
  
  const postObj = post as unknown as Record<string, unknown>
  const accountObj = account as unknown as Record<string, unknown>
  
  let result
  
  if (platform === 'facebook') {
    result = await publishToFacebook(
      accountObj.account_id as string,
      accountObj.access_token as string,
      postObj.caption as string,
      postObj.image_url as string | undefined
    )
  } else if (platform === 'instagram' && postObj.image_url) {
    result = await publishToInstagram(
      accountObj.account_id as string,
      accountObj.access_token as string,
      postObj.caption as string,
      postObj.image_url as string
    )
  } else {
    result = { success: false, error: `Unsupported platform: ${platform}` }
  }
  
  if (result.success) {
    await db.from('social_posts').update({
      status: 'published',
      published_at: new Date().toISOString(),
      platform_post_id: result.postId
    }).eq('id', postId)
    
    emitToUser(userId, WS_EVENTS['post:published'], { post_id: postId, platform, url: result.url })
  } else {
    await db.from('social_posts').update({
      status: 'failed'
    }).eq('id', postId)
    
    emitToUser(userId, WS_EVENTS['post:failed'], { post_id: postId, platform, error: result.error })
  }
}

async function processCampaignSending(job: Job): Promise<void> {
  const { campaignId, userId } = job.data
  
  emitToUser(userId, WS_EVENTS['campaign:started'], { campaign_id: campaignId })
  
  const { data: campaign } = await db.from('campaigns').select('*').eq('id', campaignId).single()
  
  if (!campaign) return
  
  const campaignObj = campaign as unknown as Record<string, unknown>
  const targetLeads = campaignObj.target_leads as string[]
  const messageTemplate = campaignObj.message_template as string
  const type = campaignObj.type as string
  
  let sent = 0
  let failed = 0
  
  for (const leadId of targetLeads) {
    const { data: lead } = await db.from('leads').select('*').eq('id', leadId).single()
    
    if (!lead) continue
    
    const leadObj = lead as unknown as Record<string, unknown>
    const message = messageTemplate
      .replace('{{first_name}}', (leadObj.name as string).split(' ')[0])
      .replace('{{company}}', leadObj.company as string || '')
    
    let result
    
    if (type === 'email' && leadObj.email) {
      result = await sendEmail({
        to: leadObj.email as string,
        subject: campaignObj.subject as string || 'From Roshanal Infotech',
        html: message
      })
    } else if (type === 'sms' && leadObj.phone) {
      result = await sendSMS(leadObj.phone as string, message)
    } else {
      continue
    }
    
    if (result.success) sent++
    else failed++
    
    emitToUser(userId, WS_EVENTS['campaign:progress'], {
      campaign_id: campaignId,
      sent,
      remaining: targetLeads.length - sent - failed
    })
  }
  
  await db.from('campaigns').update({
    status: 'sent',
    sent_at: new Date().toISOString(),
    stats: { sent, failed, total: targetLeads.length }
  }).eq('id', campaignId)
  
  emitToUser(userId, WS_EVENTS['campaign:complete'], {
    campaign_id: campaignId,
    stats: { sent, failed, total: targetLeads.length }
  })
}

async function processCompetitorScraping(job: Job): Promise<void> {
  const { competitorId, userId } = job.data
  
  emitToUser(userId, WS_EVENTS['competitor:scan_started'], { competitor_id: competitorId })
  
  const result = await scrapeCompetitor(competitorId)
  
  if (result.success) {
    emitToUser(userId, WS_EVENTS['competitor:scan_complete'], { competitor_id: competitorId })
  } else {
    emitToAdmin(WS_EVENTS['system:api_error'], { service: 'competitor-scraping', error: result.error })
  }
}

async function processLeadScraping(job: Job): Promise<void> {
  const { source, query, userId } = job.data
  
  console.log(`Processing lead scraping: ${source} - ${query}`)
  
  emitToUser(userId, WS_EVENTS['lead:new'], { source, count: 0 })
}

async function processImageGeneration(job: Job): Promise<void> {
  const { postId, prompt, userId } = job.data
  
  console.log(`Generating image for post ${postId}`)
}

async function processEmailSending(job: Job): Promise<void> {
  const { to, subject, html, userId } = job.data
  
  const result = await sendEmail({ to, subject, html })
  
  if (!result.success) {
    emitToAdmin(WS_EVENTS['system:api_error'], { service: 'email', error: result.error })
  }
}

async function processSMSSending(job: Job): Promise<void> {
  const { to, message, userId } = job.data
  
  const result = await sendSMS(to, message)
  
  if (!result.success) {
    emitToAdmin(WS_EVENTS['system:api_error'], { service: 'sms', error: result.error })
  }
}

export function startWorkers(): void {
  createWorker(QueueName.CONTENT_GENERATION, processContentGeneration)
  createWorker(QueueName.SOCIAL_PUBLISHING, processSocialPublishing)
  createWorker(QueueName.CAMPAIGN_SENDING, processCampaignSending)
  createWorker(QueueName.COMPETITOR_SCRAPING, processCompetitorScraping)
  createWorker(QueueName.LEAD_SCRAPING, processLeadScraping)
  createWorker(QueueName.IMAGE_GENERATION, processImageGeneration)
  createWorker(QueueName.EMAIL_SENDING, processEmailSending)
  createWorker(QueueName.SMS_SENDING, processSMSSending)
  
  console.log('Started all queue workers')
}

export async function getQueueHealth(): Promise<Record<string, { waiting: number; active: number; completed: number; failed: number }>> {
  const queues = [
    contentQueue, socialQueue, campaignQueue, competitorQueue,
    leadQueue, imageQueue, emailQueue, smsQueue
  ]
  
  const health: Record<string, { waiting: number; active: number; completed: number; failed: number }> = {}
  
  for (const queue of queues) {
    const status = await getQueueStatus(queue)
    health[queue.name] = status
  }
  
  return health
}
