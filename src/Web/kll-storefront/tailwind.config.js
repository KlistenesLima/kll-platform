/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: '#0f0f1a',
        surface: '#1a1a2e',
        gold: '#c9a962',
        'gold-light': '#d4b87a',
        'gold-dark': '#b08942',
        'text-primary': '#e0e0e0',
        'text-secondary': '#a0a0b0',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
