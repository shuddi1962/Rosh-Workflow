'use client'

// Authenticated CSV download helper — plain navigation to /api/* would 401
// because the JWT lives in localStorage, not cookies.
export async function downloadExport(type: string, extra = ''): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  const res = await fetch(`/api/operations/export?type=${encodeURIComponent(type)}${extra}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Export failed' }))
    throw new Error((data as { error?: string }).error || 'Export failed')
  }
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match ? match[1] : `${type}-export.csv`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
