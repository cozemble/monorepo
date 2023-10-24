/** @type {import('tailwindcss').Config} */

import plugin from 'tailwindcss/plugin'

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      keyframes: {
        blink: {
          'from, to': {
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      animation: {
        blink: 'blink 0.5s steps(1) infinite alternate',
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
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
