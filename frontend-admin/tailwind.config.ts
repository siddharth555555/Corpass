import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EAF4F3', 100: '#D2E8E6', 200: '#A7D0CD', 300: '#6FB1AD',
          400: '#2E8C88', 500: '#0A6E6E', 600: '#015C5D', 700: '#034849',
          800: '#023638', 900: '#012829', DEFAULT: '#015C5D',
        },
        canvas: '#F4F5F7',
        surface: '#FFFFFF',
        'surface-2': '#FAFBFC',
        hairline: '#ECEDF0',
        ink: '#16191C',
        slate: '#8A909A',
        border: { DEFAULT: '#ECEDF0', strong: '#E0E2E7' },
        paper: { DEFAULT: '#FFFFFF', 2: '#F4F5F7' },
        success: { DEFAULT: '#0F7A57', bg: '#E4F4EC' },
        warning: { DEFAULT: '#9A6700', bg: '#FBF0D6' },
        danger: { DEFAULT: '#C23B3B', bg: '#FBE7E7' },
        info: { DEFAULT: '#2C68B5', bg: '#E7F0FB' },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-up-1': 'fadeUp 0.5s ease-out 0.1s forwards',
        'fade-up-2': 'fadeUp 0.5s ease-out 0.2s forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
