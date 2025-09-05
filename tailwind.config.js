/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          primary: '#25D366',
          secondary: '#128C7E',
          dark: '#075E54',
          light: '#DCF8C6',
          gray: '#F0F0F0',
          darkgray: '#303030'
        }
      }
    },
  },
  plugins: [],
}
