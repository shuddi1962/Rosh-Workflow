'use client'

import { logout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 transition group"
      >
        <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600 transition" />
        <span className="font-medium text-sm">Sign Out</span>
      </button>
    </form>
  )
}
