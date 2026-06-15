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
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#FAF8F5',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F7F6F3',
          overlay: '#FFFFFF',
        },
        primary: {
          50:  '#ECEAFE',
          100: '#D5D3F8',
          200: '#B0AAEF',
          500: '#0D0A3E',
          600: '#0A0830',
          700: '#070522',
          900: '#030214',
        },
        accent: {
          50:  '#F5E8F5',
          100: '#E5C4E5',
          200: '#D19DD1',
          500: '#7B1E7A',
          600: '#621862',
          700: '#4A124A',
        },
        highlight: {
          50:  '#FBEDF1',
          100: '#F5D0DB',
          200: '#EDADC0',
          500: '#B33F62',
          600: '#8F324E',
          700: '#6B253B',
        },
        cta: {
          50:  '#FEF0EF',
          100: '#FDD5D3',
          200: '#FCB3B0',
          500: '#F9564F',
          600: '#E03E38',
          700: '#C72F29',
        },
        text: {
          primary:   '#0F172A',
          secondary: '#64748B',
          tertiary:  '#94A3B8',
          'on-brand': '#FFFFFF',
          'on-canvas': '#1E293B',
        },
        border: {
          subtle:  '#E2E0DC',
          default: '#D1D5DB',
          strong:  '#94A3B8',
          brand:   '#0D0A3E',
        },
        success: {
          50:  '#F0FDF4',
          500: '#22C55E',
          700: '#15803D'
        },
        warning: {
          50:  '#FFFBEB',
          500: '#F59E0B',
          700: '#B45309'
        },
        danger: {
          50:  '#FEF2F2',
          500: '#EF4444',
          700: '#B91C1C'
        }
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
