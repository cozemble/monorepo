/** @type {import('tailwindcss').Config} */

import plugin from 'tailwindcss/plugin'

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['"Rubik"', 'sans-serif'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    plugin(function ({ addVariant }) {
      addVariant('xs-only', "@media screen and (max-width: theme('screens.sm'))")
    }),
  ],
}
