import { createClient, InsForgeClient } from '@insforge/sdk'

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!
const insforgeApiKey = process.env.INSFORGE_API_KEY!

export const insforge: InsForgeClient = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
  isServerMode: typeof window === 'undefined',
})

export const insforgeAdmin: InsForgeClient = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeApiKey,
  isServerMode: true,
})

export type { InsForgeClient } from '@insforge/sdk'
