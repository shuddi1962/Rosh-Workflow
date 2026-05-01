import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    if (!url) {
      throw new Error('UPSTASH_REDIS_REST_URL is not set')
    }
    redis = new Redis(url)
  }
  return redis
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedis()
  const now = Date.now()
  const windowKey = `ratelimit:${key}:${Math.floor(now / (windowSeconds * 1000))}`
  
  const current = await redis.incr(windowKey)
  await redis.expire(windowKey, windowSeconds)
  
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetAt: now + windowSeconds * 1000
  }
}

export async function incrementCounter(key: string): Promise<number> {
  const redis = getRedis()
  return redis.incr(key)
}

export async function getCounter(key: string): Promise<number> {
  const redis = getRedis()
  const value = await redis.get(key)
  return value ? parseInt(value, 10) : 0
}

export async function setExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
  const redis = getRedis()
  await redis.setex(key, ttlSeconds, value)
}
