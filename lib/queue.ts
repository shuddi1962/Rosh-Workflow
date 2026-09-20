import { Queue, Worker, Job } from 'bullmq'
import { getRedis } from '@/lib/redis'

const connection = getRedis()

export enum QueueName {
  CONTENT_GENERATION = 'content-generation',
  SOCIAL_PUBLISHING = 'social-publishing',
  CAMPAIGN_SENDING = 'campaign-sending',
  COMPETITOR_SCRAPING = 'competitor-scraping',
  LEAD_SCRAPING = 'lead-scraping',
  IMAGE_GENERATION = 'image-generation',
  EMAIL_SENDING = 'email-sending',
  SMS_SENDING = 'sms-sending'
}

export function createQueue(name: QueueName): Queue {
  return new Queue(name, { connection })
}

export function createWorker(
  name: QueueName,
  processor: (job: Job) => Promise<unknown>
): Worker {
  return new Worker(name, processor, { connection })
}

export async function addJob(
  queue: Queue,
  name: string,
  data: Record<string, unknown>,
  options?: {
    delay?: number
    priority?: number
    jobId?: string
  }
): Promise<Job> {
  return queue.add(name, data, {
    delay: options?.delay,
    priority: options?.priority,
    jobId: options?.jobId,
    removeOnComplete: 100,
    removeOnFail: 50
  })
}

export async function getQueueStatus(queue: Queue): Promise<{
  waiting: number
  active: number
  completed: number
  failed: number
}> {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount()
  ])
  
  return { waiting, active, completed, failed }
}
