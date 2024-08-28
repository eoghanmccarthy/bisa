/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'retro': ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
}

