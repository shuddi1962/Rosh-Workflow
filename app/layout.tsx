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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function configureFetchGuard() {
                try {
                  Object.defineProperty(window, 'fetch', {
                    configurable: true,
                    get: function () {
                      return window.__gpFetch || globalThis.fetch
                    },
                    set: function (value) {
                      window.__gpFetch = value
                    }
                  })
                } catch (_) {}
              })()
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
