// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.SITE_URL

// https://astro.build/config
export default defineConfig({
    site: 'https://' + siteUrl,
    vite: { plugins: [tailwindcss()], },
    integrations: [sitemap()],
    image: {
        domains: ['cdn.sanity.io'],
    },
});
