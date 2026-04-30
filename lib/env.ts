import crypto from 'crypto'

export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_INSFORGE_URL',
    'NEXT_PUBLIC_INSFORGE_ANON_KEY',
    'INSFORGE_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DB_HOST',
    'DB_PASSWORD'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
  
  return true
}

export async function getApiKey(service: string, keyName: string): Promise<string | null> {
  const { DBClient } = await import('@/lib/insforge/server')
  const db = new DBClient()
  
  const { data, error } = await db
    .from('api_keys')
    .select('encrypted_value')
    .eq('service', service)
    .eq('key_name', keyName)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  
  const dataObj = data as unknown as Record<string, unknown>
  return decryptApiKey(dataObj.encrypted_value as string)
}

export function encryptApiKey(key: string): string {
  const algorithm = 'aes-256-gcm'
  const secret = process.env.ENCRYPTION_SECRET || 'roshanal-encryption-secret-32!!'
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret.slice(0, 32), 'utf8'), iv)
  let encrypted = cipher.update(key, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  
  return `${iv.toString('hex')}:${encrypted}:${authTag}`
}

export function decryptApiKey(encrypted: string): string {
  const algorithm = 'aes-256-gcm'
  const secret = process.env.ENCRYPTION_SECRET || 'roshanal-encryption-secret-32!!'
  
  const [ivHex, encryptedData, authTag] = encrypted.split(':')
  
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secret.slice(0, 32), 'utf8'),
    Buffer.from(ivHex, 'hex')
  )
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
