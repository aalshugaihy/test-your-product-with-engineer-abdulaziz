/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
      },
      backgroundImage: {
        'mesh-light': 'radial-gradient(at 20% 10%, #e0e7ff 0px, transparent 50%), radial-gradient(at 80% 0%, #fce7f3 0px, transparent 50%), radial-gradient(at 0% 80%, #ddd6fe 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 20% 10%, #1e1b4b 0px, transparent 50%), radial-gradient(at 80% 0%, #500724 0px, transparent 50%), radial-gradient(at 0% 80%, #2e1065 0px, transparent 50%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        fadeInUp: 'fadeInUp 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
}
