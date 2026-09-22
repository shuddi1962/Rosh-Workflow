import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GrowPilot AI — Business Growth Platform',
  description: 'More leads. More sales. Less work. The autonomous AI business operating system for modern teams.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
