/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Italiana"', '"Cinzel"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        editorial: ['"Playfair Display"', 'serif'],
      },
      colors: {
        charcoal: {
          900: '#09090b',
          800: '#111115',
          700: '#1a1a22',
          600: '#262630',
        },
        cream: {
          50: '#fdfcf9',
          100: '#f9f6f0',
          200: '#f1ede4',
          300: '#e5ded1',
        },
        gold: {
          light: '#f5e6b8',
          DEFAULT: '#d4af37',
          muted: '#bfa15f',
          dark: '#997a2e',
        },
        rose: {
          vintage: '#b4838f',
          deep: '#734b5e'
        }
      },
      letterSpacing: {
        widest: '.25em',
        ultra: '.4em',
      },
      animation: {
        'fade-in': 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.3' },
        }
      }
    },
  },
  plugins: [],
}
