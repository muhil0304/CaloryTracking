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
          50: '#f5f3ff',
          100: '#edd8ff',
          500: '#6366f1', // Indigo primary
          600: '#4f46e5',
          700: '#4338ca',
        },
        protein: {
          DEFAULT: '#10b981', // Emerald
          light: '#d1fae5',
          dark: '#065f46',
        },
        carbs: {
          DEFAULT: '#f59e0b', // Amber
          light: '#fef3c7',
          dark: '#92400e',
        },
        fat: {
          DEFAULT: '#f43f5e', // Rose
          light: '#ffe4e6',
          dark: '#9f1239',
        }
      }
    },
  },
  plugins: [],
}