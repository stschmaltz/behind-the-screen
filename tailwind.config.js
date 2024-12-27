/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    // If you're using the /app directory (Next.js App Router), also add:
    // './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')], // add daisyUI as a plugin
  daisyui: {
    themes: ['light', 'dark', 'cupcake', 'cyberpunk'],
  },
};
