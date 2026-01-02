/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sticky: {
          yellow: '#fbbf24',
          pink: '#f472b6',
          blue: '#60a5fa',
          green: '#4ade80',
        },
      },
    },
  },
  plugins: [],
}
