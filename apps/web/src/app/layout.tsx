import './globals.css'
import Script from 'next/script'

import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body className={`font-sans text-ink antialiased bg-paper`}>
        <Toaster position="top-right" />
        {children}
        <Script
          id="number-input-blocker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('keydown', function(e) {
                  if (e.target && e.target.type === 'number') {
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }
                }, true);
              }
            `
          }}
        />
      </body>
    </html>
  )
}
