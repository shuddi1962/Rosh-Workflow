import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { DBClient } from '@/lib/insforge/server'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!
const JWT_EXPIRY = '15m'
const REFRESH_EXPIRY = '7d'

const db = new DBClient()

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateTokens(payload: JWTPayload): { accessToken: string; refreshToken: string } {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY })
  return { accessToken, refreshToken }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ user: Record<string, unknown>; accessToken: string; refreshToken: string } | null> {
  const { data: user, error } = await db
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error || !user) return null
  
  const userObj = user as unknown as Record<string, unknown>
  const valid = await verifyPassword(password, userObj.password_hash as string)
  if (!valid) return null
  
  await db
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userObj.id as string)
  
  const payload: JWTPayload = {
    userId: userObj.id as string,
    email: userObj.email as string,
    role: userObj.role as string,
    name: userObj.full_name as string
  }
  
  const { accessToken, refreshToken } = generateTokens(payload)
  
  return { user: userObj, accessToken, refreshToken }
}
