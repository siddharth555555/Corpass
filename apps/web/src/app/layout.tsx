import './globals.css'
import { Inter, DM_Serif_Display } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-serif' })

import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} ${inter.className} text-text-primary antialiased bg-canvas`}>
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
