/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['"Rubik"', 'sans-serif'],
    },
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
