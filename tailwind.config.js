/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#e4ebf3',
          200: '#c2d2e3',
          300: '#94b3d1',
          400: '#5f8ebd',
          500: '#3d6ea2',
          600: '#2f5784',
          700: '#27476c',
          800: '#233d5c',
          900: '#20354f',
          950: '#152234',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
