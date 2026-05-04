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

  return <ApiKeysClient initialKeys={(keys as unknown as ApiKey[]) || []} />
}
