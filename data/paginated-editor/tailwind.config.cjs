/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['DM Sans'],
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [,
    ],
  },
}
