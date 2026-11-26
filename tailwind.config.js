/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vyro: {
          bg: '#060911',
          canvas: '#060911',
          card: '#0B101D',
          cardHover: '#111827',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#F59E0B', // Solar Saffron Brand Accent
          primaryHover: '#D97706',
          saffron: '#F59E0B',
          coral: '#F43F5E',
          accent: '#F59E0B',
          cyan: '#06B6D4',
          emerald: '#10B981',
          gold: '#FACC15',
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF',
          lightBorder: '#E2E8F0',
        },
        ludo: {
          red: '#DC2626',
          green: '#059669',
          yellow: '#FACC15',
          blue: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-pink': '0 0 25px -5px rgba(236, 72, 153, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
