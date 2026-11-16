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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36b0fa',
          500: '#0c94eb',
          600: '#0077cd',
          700: '#025fa8',
          800: '#06518a',
          900: '#0c4473',
          950: '#082b4c',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e3ece6',
          500: '#52796f',
          800: '#2f3e46',
          900: '#1a2421',
        },
        chalkboard: {
          bg: '#1e293b',
          grid: '#334155',
          accent: '#38bdf8',
          highlight: '#fef08a',
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        handwriting: ['Comic Sans MS', 'Caveat', 'cursive', 'sans-serif']
      }
    },
  },
  plugins: [],
}
