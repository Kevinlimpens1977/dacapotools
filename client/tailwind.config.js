/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          500: '#10B981',
          600: '#059669',
          700: '#047857'
        }
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    }
  },
  plugins: [],
}
