import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50:  '#eeeaf8',
          100: '#d9d2f4',
          200: '#b8abe9',
          300: '#9580dc',
          400: '#7c5cfc',
          500: '#6d3ff0',
          600: '#5e2ed6',
          700: '#4e24b3',
          800: '#3d1c8a',
          900: '#2c1463',
          950: '#170b38',
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease-out both',
        'fade-in':   'fadeIn 0.25s ease-out both',
        'slide-down':'slideDown 0.35s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
