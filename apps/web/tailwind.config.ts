import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'DM Serif Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:'#EAF4F3',100:'#D2E8E6',200:'#A7D0CD',300:'#6FB1AD',400:'#2E8C88',
          500:'#0A6E6E',600:'#015C5D',700:'#034849',800:'#023638',900:'#012829',
          DEFAULT:'#015C5D',
        },
        canvas:'#F4F5F7', surface:'#FFFFFF', 'surface-2':'#FAFBFC', 'surface-3':'#F1F2F5',
        hairline:'#ECEDF0', 'hairline-strong':'#E0E2E7',
        ink:'#16191C', 'ink-secondary':'#4B5563', muted:'#8A909A',
        success:{DEFAULT:'#0F7A57', bg:'#E4F4EC'},
        warning:{DEFAULT:'#9A6700', bg:'#FBF0D6'},
        danger:{DEFAULT:'#C23B3B', bg:'#FBE7E7'},
        info:{DEFAULT:'#2C68B5', bg:'#E7F0FB'},
        
        // Legacy fallbacks (to prevent total breakage while we migrate pages)
        paper: { DEFAULT: '#FFFFFF', 2: '#F4F5F7' },
        money: { DEFAULT: '#0F7A57', bg: '#E4F4EC', hover: '#0A5C41' },
        copper: { DEFAULT: '#C23B3B', bg: '#FBE7E7' },
        slate: '#8A909A',
        border: { DEFAULT: '#ECEDF0', focus: '#015C5D', subtle: '#E0E2E7', strong: '#E0E2E7', brand: '#015C5D' },
      },
      borderRadius: { card:'16px', md:'12px', pill:'999px' },
      boxShadow: {
        'cp-sm':'0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)',
        'cp-md':'0 4px 12px rgba(16,24,40,.06), 0 2px 4px rgba(16,24,40,.04)',
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
