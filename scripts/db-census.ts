import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const tables = [
    'users', 'products', 'leads', 'campaigns', 'social_posts',
    'trends', 'competitors', 'ugc_ads', 'api_keys', 'social_accounts',
    'audit_logs', 'business_profile', 'feature_toggles',
  ]
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true })
    if (error) console.log(`${t}: ERROR ${error.message}`)
    else console.log(`${t}: ${count}`)
  }
}

main()
