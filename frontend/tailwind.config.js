/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'hero-zoom': {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-bright': {
          '0%, 100%': { transform: 'scale(1)', 'box-shadow': '0 0 0 0 rgba(29, 78, 216, 0.7)' },
          '50%': { transform: 'scale(1.05)', 'box-shadow': '0 0 0 10px rgba(29, 78, 216, 0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'hero-zoom': 'hero-zoom 10s ease-out forwards',
        'pulse-bright': 'pulse-bright 2s infinite',
      }
    },
  },
  plugins: [],
}