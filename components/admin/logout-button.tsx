'use client'

import { logout } from '@/app/actions/auth'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="w-full py-2 px-3 rounded-lg text-accent-red hover:bg-bg-elevated transition text-left text-sm">
        🚪 Sign Out
      </button>
    </form>
  )
}
