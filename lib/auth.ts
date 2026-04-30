import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { insforgeAdmin } from './client'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!
const JWT_EXPIRY = '15m'
const REFRESH_EXPIRY = '7d'

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

export async function authenticateUser(email: string, password: string): Promise<{ user: any; accessToken: string; refreshToken: string } | null> {
  const { data, error } = await insforgeAdmin
    .database
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error || !data) return null
  
  const valid = await verifyPassword(password, data.password_hash)
  if (!valid) return null
  
  const payload: JWTPayload = {
    userId: data.id,
    email: data.email,
    role: data.role,
    name: data.full_name
  }
  
  const { accessToken, refreshToken } = generateTokens(payload)
  
  await insforgeAdmin
    .database
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id)
  
  return { user: data, accessToken, refreshToken }
}
