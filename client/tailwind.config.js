/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          50: '#f0f9ff',
          100: '#e8f2f8',
          200: '#d4e9f4',
          300: '#a0d6e8',
          400: '#67c3dd',
          500: '#3ab0d2',
          600: '#2891b0',
          700: '#1e7490',
        },
        glass: {
          50: 'rgba(255, 255, 255, 0.95)',
          100: 'rgba(255, 255, 255, 0.85)',
          200: 'rgba(255, 255, 255, 0.75)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'apple': '0 2px 16px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'apple-xl': '0 20px 48px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(160, 214, 232, 0.4)',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif']
    }
  },
  plugins: [],
}
