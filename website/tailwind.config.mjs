/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'spartaGray': '#242424',
				'spartaRed': '#e02b20'
			}
		},
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
