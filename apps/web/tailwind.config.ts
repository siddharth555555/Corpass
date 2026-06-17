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
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
        },
        slate: 'var(--slate)',
        paper: {
          DEFAULT: 'var(--paper)',
          2: 'var(--paper-2)',
        },
        money: {
          DEFAULT: 'var(--money)',
          hover: 'var(--money-hover)',
          bg: 'var(--money-bg)',
        },
        copper: {
          DEFAULT: 'var(--copper)',
          bg: 'var(--copper-bg)',
        },
        canvas: 'var(--paper)',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: 'var(--paper-2)',
          overlay: '#FFFFFF',
        },
        primary: {
          50:  'var(--paper-2)',
          100: '#D5D3F8',
          200: '#B0AAEF',
          500: 'var(--ink)',
          600: 'var(--ink-2)',
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
          50:  'var(--copper-bg)',
          100: '#FDD5D3',
          200: '#FCB3B0',
          500: 'var(--copper)',
          600: '#E03E38',
          700: '#C72F29',
        },
        text: {
          primary:   'var(--ink)',
          secondary: 'var(--ink-2)',
          tertiary:  'var(--slate)',
          'on-brand': 'var(--paper)',
          'on-canvas': 'var(--ink)',
        },
        border: {
          DEFAULT: 'var(--border)',
          focus: 'var(--border-focus)',
          subtle:  'var(--border)',
          strong:  'var(--ink-2)',
          brand:   'var(--ink)',
        },
        success: {
          50:  'var(--money-bg)',
          500: 'var(--money)',
          700: 'var(--money-hover)'
        },
        warning: {
          50:  '#FFFBEB',
          500: '#F59E0B',
          700: '#B45309'
        },
        danger: {
          50:  'var(--copper-bg)',
          500: 'var(--copper)',
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
