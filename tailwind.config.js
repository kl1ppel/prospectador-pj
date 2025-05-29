/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#666666',
        accent: '#cccccc',
        neutral: '#ffffff',
        basetone: '#000000',
        whatsapp: '#25D366',
      }
    }
  },
  plugins: [],
}