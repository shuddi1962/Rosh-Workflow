'use server'

import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function createUser(formData: FormData) {
  const { hashPassword } = await import('@/lib/auth')
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as 'admin' | 'operator'
  
  const password_hash = await hashPassword(password)
  
  await db
    .from('users')
    .insert({ email, password_hash, full_name, role, is_active: true })
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  await db
    .from('users')
    .update({ is_active: !isActive })
    .eq('id', userId)
}
