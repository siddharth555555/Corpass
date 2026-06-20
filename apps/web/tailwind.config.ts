import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--cp-font-serif)', 'Courier New', 'Courier', 'monospace'],
        sans: ['var(--cp-font-sans)', 'Courier New', 'Courier', 'monospace'],
        mono: ['var(--cp-font-mono)', 'Courier New', 'Courier', 'monospace'],
      },
      colors: {
        brand: {
          50:'var(--cp-brand-50)',100:'var(--cp-brand-100)',200:'var(--cp-brand-200)',300:'var(--cp-brand-300)',400:'var(--cp-brand-400)',
          500:'var(--cp-brand-500)',600:'var(--cp-brand-600)',700:'var(--cp-brand-700)',800:'var(--cp-brand-800)',900:'var(--cp-brand-900)',
          DEFAULT:'var(--cp-brand-600)',
        },
        canvas:'var(--cp-bg)', surface:'var(--cp-surface)', 'surface-2':'var(--cp-surface-2)', 'surface-3':'var(--cp-surface-3)',
        hairline:'var(--cp-border)', 'hairline-strong':'var(--cp-border-strong)',
        ink:'var(--cp-text)', 'ink-secondary':'var(--cp-text-secondary)', muted:'var(--cp-text-muted)',
        success:{DEFAULT:'var(--cp-success)', bg:'var(--cp-success-bg)'},
        warning:{DEFAULT:'var(--cp-warning)', bg:'var(--cp-warning-bg)'},
        danger:{DEFAULT:'var(--cp-danger)', bg:'var(--cp-danger-bg)'},
        info:{DEFAULT:'var(--cp-info)', bg:'var(--cp-info-bg)'},
        
        // Legacy fallbacks (to prevent total breakage while we migrate pages)
        paper: { DEFAULT: 'var(--cp-bg)', 2: 'var(--cp-surface-2)' },
        money: { DEFAULT: 'var(--cp-text)', bg: 'var(--cp-success-bg)', hover: 'var(--cp-text)' },
        copper: { DEFAULT: 'var(--cp-text)', bg: 'var(--cp-danger-bg)' },
        slate: 'var(--cp-text-muted)',
        border: { DEFAULT: 'var(--cp-border)', focus: 'var(--cp-brand-600)', subtle: 'var(--cp-border)', strong: 'var(--cp-border-strong)', brand: 'var(--cp-brand-600)' },
      },
      borderRadius: { card:'0px', md:'0px', pill:'0px' },
      boxShadow: {
        'cp-sm':'var(--cp-shadow-sm)',
        'cp-md':'var(--cp-shadow-md)',
      },
      animation: {
        blob: "blob 7s infinite",
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-up-1': 'fadeUp 0.5s ease-out 0.1s forwards',
        'fade-up-2': 'fadeUp 0.5s ease-out 0.2s forwards',
        'fade-up-3': 'fadeUp 0.5s ease-out 0.3s forwards',
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
export default config
