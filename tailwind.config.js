/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f0',
          100: '#ffe0de',
          200: '#ffc6c2',
          300: '#ff9f97',
          400: '#ff6b5e',
          500: '#f83b2c',
          600: '#e51e0f',
          700: '#c1150a',
          800: '#a0150d',
          900: '#841812',
          950: '#480704',
        },
        nepal: {
          red: '#DC143C',
          blue: '#003893',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
