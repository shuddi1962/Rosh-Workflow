import crypto from 'crypto'

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'fallback-secret-change-in-production'
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'fallback-iv-change-in-prod!!'

const ALGORITHM = 'aes-256-gcm'
const KEY = crypto.scryptSync(ENCRYPTION_SECRET, 'salt', 32)
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivB64, authTagB64, encrypted] = encryptedText.split(':')
  
  if (!ivB64 || !authTagB64 || !encrypted) {
    throw new Error('Invalid encrypted data format')
  }
  
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

export function hashSensitive(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}
