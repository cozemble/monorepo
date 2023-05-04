/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		fontFamily: {
			sans: ['DM Sans']
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				cozemble: {
					primary: '#141339',
					secondary: '#66999B',
					accent: '#dbfc6f',
					neutral: '#324168',
					'base-100': '#FFFFFF',
					'base-200': '#F5F5FB',
					'base-300': '#E9E9EF',
					// 'base-200': '#EAEDF6',
					info: '#546AD9',
					success: '#27A061',
					warning: '#F6D637',
					error: '#FB5353'
				}
			}
		]
	}
};
