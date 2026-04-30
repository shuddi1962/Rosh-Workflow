import { insforgeAdmin } from '@/lib/insforge/client'

export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_INSFORGE_URL',
    'NEXT_PUBLIC_INSFORGE_ANON_KEY',
    'INSFORGE_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
  
  return true
}

export async function getApiKey(service: string, keyName: string): Promise<string | null> {
  const { data, error } = await insforgeAdmin
    .database
    .from('api_keys')
    .select('encrypted_value')
    .eq('service', service)
    .eq('key_name', keyName)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  
  return decryptApiKey(data.encrypted_value)
}

export function encryptApiKey(key: string): string {
  const crypto = require('crypto')
  const algorithm = 'AES-256-GCM'
  const secret = process.env.ENCRYPTION_SECRET!
  const iv = process.env.ENCRYPTION_IV!
  
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret, 'hex'), Buffer.from(iv, 'hex'))
  let encrypted = cipher.update(key, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  
  return `${encrypted}:${authTag}`
}

export function decryptApiKey(encrypted: string): string {
  const crypto = require('crypto')
  const algorithm = 'AES-256-GCM'
  const secret = process.env.ENCRYPTION_SECRET!
  const iv = process.env.ENCRYPTION_IV!
  
  const [encryptedData, authTag] = encrypted.split(':')
  
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret, 'hex'), Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
