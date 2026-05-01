import cron, { type ScheduledTask } from 'node-cron'
import { QueueName, createQueue, addJob } from '@/lib/queue'

const contentQueue = createQueue(QueueName.CONTENT_GENERATION)
const socialQueue = createQueue(QueueName.SOCIAL_PUBLISHING)
const campaignQueue = createQueue(QueueName.CAMPAIGN_SENDING)
const competitorQueue = createQueue(QueueName.COMPETITOR_SCRAPING)
const leadQueue = createQueue(QueueName.LEAD_SCRAPING)

const CRON_JOBS = {
  process_scheduled_posts: '*/1 * * * *',
  process_campaign_queue: '*/2 * * * *',
  fetch_google_trends: '*/15 * * * *',
  fetch_news_api: '*/15 * * * *',
  fetch_social_trends: '*/30 * * * *',
  track_post_engagement: '*/20 * * * *',
  analyze_competitor_content: '0 * * * *',
  generate_content_ideas: '0 */2 * * *',
  refresh_lead_scores: '0 */3 * * *',
  full_competitor_scrape: '0 6 * * *',
  generate_weekly_calendar: '0 7 * * MON',
  send_analytics_report: '0 8 * * *',
  scrape_competitor_ads: '0 9 * * *',
  cleanup_expired_trends: '0 3 * * *',
  verify_social_tokens: '0 10 * * *',
  full_lead_scrape: '0 8 * * MON',
  generate_content_calendar: '0 9 * * SUN',
  competitor_intel_report: '0 10 * * MON'
}

const scheduledTasks: ScheduledTask[] = []

export function startCronJobs(): void {
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.process_scheduled_posts, () => {
      addJob(socialQueue, 'process-scheduled-posts', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.process_campaign_queue, () => {
      addJob(campaignQueue, 'process-campaign-queue', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.fetch_google_trends, () => {
      addJob(contentQueue, 'fetch-trends', { source: 'google', timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.fetch_news_api, () => {
      addJob(contentQueue, 'fetch-news', { source: 'newsapi', timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.fetch_social_trends, () => {
      addJob(contentQueue, 'fetch-social-trends', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.track_post_engagement, () => {
      addJob(socialQueue, 'track-engagement', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.analyze_competitor_content, () => {
      addJob(competitorQueue, 'analyze-competitor', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.generate_content_ideas, () => {
      addJob(contentQueue, 'generate-ideas', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.refresh_lead_scores, () => {
      addJob(leadQueue, 'refresh-scores', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.full_competitor_scrape, () => {
      addJob(competitorQueue, 'full-scrape', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.cleanup_expired_trends, () => {
      addJob(contentQueue, 'cleanup-trends', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.verify_social_tokens, () => {
      addJob(socialQueue, 'verify-tokens', { timestamp: Date.now() })
    })
  )
  
  scheduledTasks.push(
    cron.schedule(CRON_JOBS.full_lead_scrape, () => {
      addJob(leadQueue, 'full-scrape', { timestamp: Date.now() })
    })
  )
  
  console.log(`Started ${scheduledTasks.length} cron jobs`)
}

export function stopCronJobs(): void {
  scheduledTasks.forEach(task => task.stop())
  console.log('Stopped all cron jobs')
}

export function getCronJobs(): Array<{ name: string; schedule: string; status: string }> {
  return Object.entries(CRON_JOBS).map(([name, schedule]) => ({
    name,
    schedule,
    status: 'active'
  }))
}
