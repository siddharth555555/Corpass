import './globals.css'
import { Inter, Fraunces, IBM_Plex_Mono } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif' })
const ibmPlexMono = IBM_Plex_Mono({ weight: ['400', '500', '600'], subsets: ['latin'], variable: '--font-mono' })

import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable} ${inter.className} text-ink antialiased bg-paper`}>
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
