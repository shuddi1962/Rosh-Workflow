import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roshanal AI - Intelligent Business Growth Platform',
  description: 'AI-powered marketing platform for Roshanal Infotech Limited, Port Harcourt, Nigeria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@700,600,500&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-bg-void text-text-primary font-cabinet">
        {children}
      </body>
    </html>
  )
}
