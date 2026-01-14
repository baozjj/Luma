/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#9CA3AF',
        accent: '#3B82F6',
        background: '#FAFAFA'
      }
    },
  },
  plugins: [],
}
