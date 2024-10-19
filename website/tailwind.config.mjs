/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
		colors: {
			'darkGrey': '#242424',
			'red': '#e02b20'
		}
	},
	daisyui: {
		themes: [
			{
				light: {
					...require("daisyui/src/theming/themes")["light"],
				},
			},
		],
	},
	plugins: [require('daisyui'),],
}
