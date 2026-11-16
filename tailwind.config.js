/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf4f6',
          100: '#f5e8eb',
          200: '#ebd3d8',
          300: '#dab1bb',
          400: '#c28595',
          500: '#a85d72',
          600: '#800020', // Classic Rich Burgundy Accent
          700: '#6f001c',
          800: '#5c0018',
          900: '#4a0013',
          950: '#2d000a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'float-slow': 'float 18s ease-in-out infinite',
        'float-medium': 'float 12s ease-in-out infinite reverse',
        'pulse-subtle': 'pulseSlow 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-24px) translateX(12px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
}
