import { DBClient } from '@/lib/insforge/server'
import ApiKeysClient from './ApiKeysClient'
import type { ApiKey } from '@/lib/insforge/schema'

const db = new DBClient()

export default async function AdminApiKeysPage() {
  const { data: keys } = await db
    .from('api_keys')
    .select('id, service, key_name, is_active, last_tested, last_test_result, usage_today, updated_at')
    .order('service', { ascending: true })

  return <ApiKeysClient initialKeys={(keys as unknown as ApiKey[]) || []} />
}
