import { DBClient } from '@/lib/insforge/server'
import ApiKeysClient from './ApiKeysClient'
import type { ApiKey } from '@/lib/insforge/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const db = new DBClient()

export default async function AdminApiKeysPage() {
  const { data: keys, error } = await db
    .from('api_keys')
    .select('id, service, key_name, is_active, last_tested, last_test_result, usage_today, usage_all_time, updated_at, created_at')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching API keys:', error)
  }

  const normalizedKeys = ((keys || []) as any[]).map((k: any) => ({
    ...k,
    is_active: k.is_active === true || k.is_active === 'true' || k.is_active === 1,
    usage_today: typeof k.usage_today === 'string' ? parseFloat(k.usage_today) : (k.usage_today || 0),
    usage_all_time: typeof k.usage_all_time === 'string' ? parseFloat(k.usage_all_time) : (k.usage_all_time || 0)
  })) as unknown as ApiKey[]

  return <ApiKeysClient initialKeys={normalizedKeys} />
}
